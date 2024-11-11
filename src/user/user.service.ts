import { TemplateService } from './../template/template.service';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TemplateMetaModel } from 'src/template/entries/template-meta.entity';
import { UserModel } from 'src/user/entries/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserModel)
    private readonly userRepository: Repository<UserModel>,
    @InjectRepository(TemplateMetaModel)
    private readonly templateMetaRepository: Repository<TemplateMetaModel>,
    private readonly TemplateService: TemplateService,
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

  //내가 만든 템플릿 가져오기
  async getMyContents({ id: userId }: Pick<UserModel, 'id'>) {
    console.log(userId);
    return await this.TemplateService.getList({ id: userId });
  }
}
