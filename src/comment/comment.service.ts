import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { instanceToPlain } from 'class-transformer';
import { AuthService } from 'src/auth/auth.service';
import { CreateCommentDto } from 'src/comment/dto/createComment.dto';
import { DeleteCommentDto } from 'src/comment/dto/deleteComment.dto';
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

    const comments = this.commentRepository
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.replies', 'replies')
      .leftJoinAndSelect('comment.user', 'wirteUser')
      .leftJoin('replies.user', 'replywirteUser')

      .where('comment.templateId = :templateId', {
        templateId: isExistTemplate.id,
      })
      .addSelect('wirteUser.id') // comment 유저
      .addSelect('replywirteUser.id')

      .orderBy('comment.id', 'DESC')
      .addOrderBy('replies.id', 'DESC') //  reply 유저

      .getMany();

    return instanceToPlain(comments);
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

  async deleteCommentTarget(
    id: number,
    password: DeleteCommentDto['password'],
  ) {
    const isExistComment = await this.commentRepository.findOne({
      where: { id },
    });

    if (!isExistComment) {
      throw new NotFoundException('이미 삭제되었거나 잘못된 요청입니다');
    }

    await this.authService.verifyPassword(
      password,
      (await isExistComment).password,
    );

    return await this.commentRepository.delete({ id });
  }
}
