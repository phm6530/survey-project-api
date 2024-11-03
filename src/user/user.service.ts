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
  async getUser({
    id,
    email,
  }: Pick<UserModel, 'id'> & Partial<Pick<UserModel, 'email'>>) {
    const whereCondition = email ? { id, email } : { id };
    const userData = await this.userRepository.findOne({
      where: whereCondition,
    });

    return userData;
  }
}
