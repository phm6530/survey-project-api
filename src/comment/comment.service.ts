import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateCommentDto } from 'src/comment/dto/createComment.dto';
import { CommentModel } from 'src/comment/entries/comment.entity';
import { CommonService } from 'src/common/common.service';
import { paramsTemplateAndId } from 'type/template';
import { QueryRunner, Repository } from 'typeorm';

@Injectable()
export class CommentService {
  constructor(
    private readonly commonService: CommonService,
    @InjectRepository(CommentModel)
    private readonly commentRepository: Repository<CommentModel>,
  ) {}

  async createComment(
    params: paramsTemplateAndId,
    body: CreateCommentDto,
    qr: QueryRunner,
    user?: { id: string },
  ) {
    const { comment, password } = body;
    const template = await this.commonService.isExistTemplate(
      { id: params.id, templateType: params.template },
      qr,
    );

    const repository = qr.manager.getRepository<CommentModel>(CommentModel);
    const entity = repository.create({
      template: { id: template.id },
      comment,
      user: user ? { id: +user.id } : null,
      password: !user ? password : null,
    });

    await repository.save(entity);
  }
}
