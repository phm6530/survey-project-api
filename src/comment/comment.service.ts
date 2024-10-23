import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { instanceToPlain } from 'class-transformer';
import { AuthService } from 'src/auth/auth.service';
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
    private readonly authService: AuthService,
  ) {}

  //댓글 리스트 가져오기
  async getcommentList({ id, template }: paramsTemplateAndId) {
    const isExistTemplate = await this.commonService.isExistTemplate({
      id: id,
      templateType: template,
    });

    const test = await this.commentRepository.find({
      where: {
        template: { id: isExistTemplate.id },
      },
      relations: ['replies', 'user'],
    });

    return instanceToPlain(test);
  }

  //댓글 생성
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
      password: !user
        ? await this.authService.hashTransformPassword(password)
        : null,
    });

    //패스워드 직렬화 제거
    return instanceToPlain(await repository.save(entity));
  }

  async deleteCommentTarget(commentId: string) {
    console.log(typeof commentId);
    return commentId;
  }
}
