import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { UserModel } from 'src/user/entries/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryRunner, Repository } from 'typeorm';
import { RegisterUserDto } from 'src/auth/dto/user-register.dto';
import { instanceToPlain } from 'class-transformer';
import { SignInDto } from 'src/auth/dto/user-signIn.dto';
import { JwtService } from '@nestjs/jwt';
import { RefreshTokenModel } from 'src/auth/entries/refreshToken.entity';
import { ENV_KEYS } from 'config/jwt.config';
import { CommonService } from 'src/common/common.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly ConfigService: ConfigService,
    @InjectRepository(UserModel)
    private readonly userModelRepository: Repository<UserModel>,
    private readonly jwtService: JwtService,
    @InjectRepository(RefreshTokenModel)
    private readonly refreshTokenRepository: Repository<RefreshTokenModel>,
    private readonly commonService: CommonService,
  ) {}

  //User Find
  async isExistUser({ email, nickname }: { email: string; nickname?: string }) {
    const queryBuilder = this.userModelRepository
      .createQueryBuilder('user')
      .where('user.email = :email', { email });

    if (nickname) {
      queryBuilder.orWhere('user.nickname = :nickname', { nickname });
    }
    return await queryBuilder.getOne();
  }

  //password Hash
  async hashTransformPassword(password: string) {
    //salt
    return await bcrypt.hash(
      password,
      parseInt(this.ConfigService.get<string>(ENV_KEYS.AUTH.HASH)),
    );
  }

  //password 검증
  async verifyPassword(
    inputPassword: string,
    storedHashedPassword: string,
    throwError: boolean = true,
  ): Promise<boolean> {
    const isVerify = await bcrypt.compare(inputPassword, storedHashedPassword);
    if (!isVerify && throwError) {
      throw new ForbiddenException('이메일이나 패스워드가 일치하지 않습니다');
    }
    return isVerify;
  }

  // 토큰검증
  async verflyToken(token: string): Promise<UserModel> {
    try {
      const payload = await this.jwtService.verify(token, {
        secret: this.ConfigService.get<string>(ENV_KEYS.AUTH.SCRECT_KEY),
      });

      return payload as UserModel;
    } catch (error) {
      throw new UnauthorizedException(
        error.message || '유효한 토큰이 아닙니다.',
      );
    }
  }

  async updatePassword(userEmail: string, newPassword: string) {
    const hashPassword = await this.hashTransformPassword(newPassword);
    return await this.userModelRepository.update(
      { email: userEmail },
      { password: hashPassword },
    );
  }

  //회원가입
  async createUser(
    { nickname, password, email }: RegisterUserDto,
    qr: QueryRunner,
  ) {
    const userRepository = qr.manager.getRepository<UserModel>(UserModel);

    const user = await this.isExistUser({ email });

    if (!!user)
      throw new BadRequestException('이미 존재하는 닉네임이거나 email 입니다.');

    //비밀번호 해쉬화 시키고
    const hashPassword = await this.hashTransformPassword(password);

    // 엔티티생성하고
    const userEntity = this.userModelRepository.create({
      nickname,
      password: hashPassword,
      email,
    });

    // 반영
    const saveduser = await userRepository.save(userEntity);
    return instanceToPlain(saveduser);
  }

  async existUser({ email }) {
    const isExistUser = await this.isExistUser({ email });

    if (!isExistUser) {
      throw new BadRequestException('이메일이나 패스워드가 일치하지 않습니다');
    }

    return isExistUser;
  }

  async loginUser({ email, password }: SignInDto) {
    //존재하는유저인지 찾기
    const isExistUser = await this.existUser({ email });
    const verfiy = await this.verifyPassword(password, isExistUser.password);

    if (!verfiy) {
      throw new BadRequestException('이메일이나 패스워드가 일치하지 않습니다');
    } else {
      const { role, email, nickname, id } = isExistUser;

      //엑세스 토큰 1분
      const token = this.addToken({ id, role, email, nickname });
      return { token, user: isExistUser };
    }
  }

  // JWT 생성
  addToken(user: Pick<UserModel, 'role' | 'email' | 'nickname' | 'id'>) {
    /** 토큰 한개로 관리하기 위해서 2가지 시간 설정*/
    const refreshTime = this.ConfigService.get<string>(
      ENV_KEYS.JWT.JWT_TOKEN_REFRESH_IN,
    );
    const expireTime = this.ConfigService.get<string>(
      ENV_KEYS.JWT.JWT_TOKEN_EXPIRES_IN,
    );

    // 업데이트 주기
    const refreshExp =
      this.commonService.parseTime(refreshTime) + Math.floor(Date.now() / 1000);

    //ScrectKey Get
    const secrectKey = this.ConfigService.get<string>(ENV_KEYS.AUTH.SCRECT_KEY);

    const payload = { ...user, refreshExp };

    const token = this.jwtService.sign(payload, {
      secret: secrectKey,
      expiresIn: expireTime,
    });

    const decodeT = this.jwtService.decode(token);
    console.log(decodeT);

    return token;
  }

  async createAccessToken(id: number) {
    const user = await this.userModelRepository.findOne({
      where: {
        id,
      },
    });
    return this.addToken({
      role: user.role,
      email: user.email,
      nickname: user.nickname,
      id: user.id,
    });
  }

  async saveRefreshToken(user: UserModel, token: string) {
    try {
      const entity = this.refreshTokenRepository.create({
        token,
        user: { id: user.id },
      });
      await this.refreshTokenRepository.save(entity);
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('서버오류');
    }
  }
}
