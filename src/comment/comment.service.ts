import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { instanceToPlain } from 'class-transformer';
import { AuthService } from 'src/auth/auth.service';
import { CreateCommentDto } from 'src/comment/dto/createComment.dto';
import { DeleteCommentDto } from 'src/comment/dto/deleteComment.dto';
import { CommentModel } from 'src/comment/entries/comment.entity';
import { CommonService } from 'src/common/common.service';
import { UserModel } from 'src/user/entries/user.entity';

import { UserService } from 'src/user/user.service';
import { paramsTemplateAndId } from 'type/template';
import { QueryRunner, Repository } from 'typeorm';

@Injectable()
export class CommentService {
  constructor(
    private readonly commonService: CommonService,
    @InjectRepository(CommentModel)
    private readonly commentRepository: Repository<CommentModel>,
    private readonly authService: AuthService,
    private readonly UserService: UserService,
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
      .leftJoinAndSelect('replies.user', 'replywirteUser')

      .where('comment.templateId = :templateId', {
        templateId: isExistTemplate.id,
      })
      .addSelect('wirteUser.id') // comment 유저
      .addSelect('replywirteUser.id')

      .orderBy('comment.id', 'ASC')
      .addOrderBy('replies.id', 'ASC') //  reply 유저

      .getMany();

    return instanceToPlain(comments);
  }

  //댓글 생성
  async createComment(
    params: paramsTemplateAndId,
    body: CreateCommentDto,
    qr: QueryRunner,
  ) {
    //익명으로 댓글을 남길때는 꼭 anonymous 체크하기
    const { userId, content, password, anonymous } = body;
    const template = await this.commonService.isExistTemplate(
      { id: params.id, templateType: params.template },
      qr,
    );

    //유저면 user Entity 없으면 Null
    const user = userId
      ? await this.UserService.getUser({ id: +userId })
      : null;

    // const { userId: id, comment } = body;

    const repository = qr.manager.getRepository<CommentModel>(CommentModel);
    const entity = repository.create({
      template: { id: template.id },
      content,
      user,
      anonymous: !user ? anonymous : null,
      password: !user
        ? await this.authService.hashTransformPassword(password)
        : null,
    });

    //패스워드 직렬화 제거
    return instanceToPlain(await repository.save(entity));
  }

  async deleteCommentTarget(
    id: number,
    user: UserModel | null,
    password: DeleteCommentDto['password'],
  ) {
    const isExistComment = await this.commentRepository.findOne({
      where: { id },
    });

    if (!isExistComment) {
      throw new NotFoundException('이미 삭제되었거나 잘못된 요청입니다');
    }

    if (!user && password) {
      await this.authService.verifyPassword(password, isExistComment.password);
    }
    return await this.commentRepository.delete({ id });
  }
}
