import { ConfigService } from '@nestjs/config';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserModel } from 'src/user/entries/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryRunner, Repository } from 'typeorm';
import { RegisterUserDto } from 'src/auth/dto/user-register.dto';
import { instanceToPlain } from 'class-transformer';
import { SignInDto } from 'src/auth/dto/user-signIn.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly ConfigService: ConfigService,
    @InjectRepository(UserModel)
    private readonly userModelRepository: Repository<UserModel>,
  ) {}

  async hashTransformPassword(password: string) {
    //salt
    return await bcrypt.hash(
      password,
      parseInt(this.ConfigService.get<string>('HASH')),
    );
  }

  async verifyPassword(inputPassword: string, storedHashedPassword: string) {
    const isVerify = await bcrypt.compare(inputPassword, storedHashedPassword);
    if (!isVerify) {
      throw new BadRequestException('비밀번호가 일치하지 않습니다.');
    }
    return isVerify;
  }

  //crateUser...
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

    console.log('isExsitEmailorNickname:::', isExsitEmailorNickname);

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
      return { message: '비밀번호가 일치합니다' };
    }
  }
}
