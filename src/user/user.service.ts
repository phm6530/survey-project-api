import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserModel } from 'src/user/entries/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserModel)
    private readonly userRepository: Repository<UserModel>,
  ) {}
  async getUser({ id, email }: Pick<UserModel, 'id' | 'email'>) {
    const UserDatas = await this.userRepository.findOne({
      where: [
        {
          id,
        },
        { email },
      ],
    });
    return UserDatas;
  }
}
