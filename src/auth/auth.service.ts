import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
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

@Injectable()
export class AuthService {
  constructor(
    private readonly ConfigService: ConfigService,
    @InjectRepository(UserModel)
    private readonly userModelRepository: Repository<UserModel>,
    private readonly jwtService: JwtService,
    @InjectRepository(RefreshTokenModel)
    private readonly refreshTokenRepository: Repository<RefreshTokenModel>,
  ) {}

  //password Hash
  async hashTransformPassword(password: string) {
    //salt
    return await bcrypt.hash(
      password,
      parseInt(this.ConfigService.get<string>('HASH')),
    );
  }

  //password 검증
  async verifyPassword(inputPassword: string, storedHashedPassword: string) {
    const isVerify = await bcrypt.compare(inputPassword, storedHashedPassword);
    if (!isVerify) {
      throw new BadRequestException('비밀번호가 일치하지 않습니다.');
    }
    return isVerify;
  }

  // 토큰검증
  async verflyToken(token: string) {
    return this.jwtService.verify(token, {
      secret: this.ConfigService.get<string>('SECRECT_KEY'),
    });
  }

  //회원가입
  async createUser(
    { nickname, password, email }: RegisterUserDto,
    qr: QueryRunner,
  ) {
    const userRepository = qr.manager.getRepository<UserModel>(UserModel);

    const isExsitEmailorNickname = await userRepository
      .createQueryBuilder('user')
      .where('user.email = :email', { email })
      .orWhere('user.nickname = :nickname', { nickname })
      .getOne();

    if (!!isExsitEmailorNickname)
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

  async loginUser({ email, password }: SignInDto) {
    //존재하는유저인지 찾기
    const isExistUser = await this.userModelRepository.findOne({
      where: { email },
    });

    if (!isExistUser) {
      throw new NotFoundException(
        '없는 사용자거나 패스워드가 일치하지않습니다.',
      );
    }
    const verfiy = await this.verifyPassword(password, isExistUser.password);
    if (!verfiy) {
      throw new BadRequestException('비밀번호가 일치하지 않습니다');
    } else {
      const { role, email, nickname, id } = isExistUser;
      //엑세스 10분
      const accessToken = await this.addToken(
        { id, role, email, nickname },
        600,
      );

      console.log('isExistUser::', isExistUser);

      //리프래시 토큰 1시간
      const refreshToken = await this.addToken(
        { id, role, email, nickname },
        3600,
      );
      return { accessToken, refreshToken, user: isExistUser };
    }
  }

  // JWT 생성
  async addToken(
    user: Pick<UserModel, 'role' | 'email' | 'nickname' | 'id'>,
    expiresIn: number = 300,
  ) {
    //ScrectKey Get
    const secrectKey = this.ConfigService.get<string>('SECRET_KEY');
    const payload = { ...user };

    return this.jwtService.sign(payload, {
      secret: secrectKey,
      expiresIn,
    });
  }

  async createAccessToken(id: number) {
    const getRefreshToken = await this.refreshTokenRepository.findOne({
      where: [
        {
          isVaild: true,
        },
        {
          user: { id },
        },
      ],
      relations: ['user'],
    });

    if (!getRefreshToken) {
      throw new BadRequestException('일치하는 토큰이 없습니다.');
    }

    const isExipreToken = this.verflyToken(getRefreshToken.token);
    if (!isExipreToken) {
      throw new UnauthorizedException('유효하지 않은 리프레시 토큰입니다.');
    }

    //엑세스 10분
    // const accessToken = await this.addToken({ role, email, nickname }, 600);
  }

  async saveRefreshToken(user: UserModel, token: string) {
    try {
      const entity = this.refreshTokenRepository.create({
        token,
        user: { id: user.id },
      });
      await this.refreshTokenRepository.save(entity);
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('서버오류');
    }
  }

  async invalidateRefreshToken(id: number) {
    console.log(id);

    // const find = await this.userModelRepository.findOne({
    //   where: {
    //     id,
    //   },
    // });

    // console.log(find);

    //업데이트
    await this.refreshTokenRepository.update(
      { user: { id } },
      { isVaild: false },
    );
  }
}
