import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { instanceToPlain } from 'class-transformer';
import { AuthService } from 'src/auth/auth.service';
import { CreateCommentDto } from 'src/comment/dto/createComment.dto';
import { DeleteCommentDto } from 'src/comment/dto/deleteComment.dto';
import { CommentModel } from 'src/comment/entries/comment.entity';
import { CommonService } from 'src/common/common.service';
import { UserModel } from 'src/user/entries/user.entity';

import { UserService } from 'src/user/user.service';
import { USER_ROLE } from 'type/auth';
import { paramsTypeAndId } from 'type/template';
import { QueryRunner, Repository } from 'typeorm';

export enum COMMENT_NEED_PATH {
  TEMPLATE = 'template',
  BOARD = 'board',
}

@Injectable()
export class CommentService {
  constructor(
    private readonly commonService: CommonService,
    @InjectRepository(CommentModel)
    private readonly commentRepository: Repository<CommentModel>,
    private readonly authService: AuthService,
    private readonly UserService: UserService,
  ) {}

  private getCreatorInfo = (anonymous?: string, user?: any) => {
    if (!(user?.role === USER_ROLE.ADMIN || user?.role === USER_ROLE.USER)) {
      return {
        role: USER_ROLE.ANONYMOUS,
        nickname: anonymous,
      };
    }
    return {
      role: user.role,
      nickname: user.nickname,
      email: user.email,
    };
  };

  public async deleteRelationComment(
    {
      parentId,
      parentType,
    }: { parentId: number; parentType: COMMENT_NEED_PATH },
    qr?: QueryRunner,
  ): Promise<void> {
    // 트랜잭션 유무 처리
    const repo = qr
      ? qr.manager.getRepository<CommentModel>(CommentModel)
      : this.commentRepository;

    try {
      // 관련 댓글 삭제
      await repo.delete({ parentId, parentType });
    } catch (error) {
      console.log(error);
      throw new BadRequestException(error.message);
    }
  }

  //댓글 리스트 가져오기
  async getcommentList({ parentType, parentId }: paramsTypeAndId) {
    // await this.commonService.isExistTemplate({
    //   id: parentId,
    // });

    const comments = await this.commentRepository
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.replies', 'replies')
      .leftJoinAndSelect('comment.user', 'wirteUser')
      .leftJoinAndSelect('replies.user', 'replywirteUser')

      .where('comment.parentId = :parentId', {
        parentId,
      })
      .andWhere('comment.parentType =:parentType', { parentType })
      .addSelect('wirteUser.id') // comment 유저
      .addSelect('replywirteUser.id')

      .orderBy('comment.id', 'ASC')
      .addOrderBy('replies.id', 'ASC') //  reply 유저

      .getMany();

    const resultDatas = comments.map((e) => {
      return {
        ...e,
        createdAt: this.commonService.transformTimeformat(e.createdAt),
        replies: e.replies.map((reply) => {
          return {
            ...reply,
            createdAt: this.commonService.transformTimeformat(reply.createdAt),
            creator: { ...this.getCreatorInfo(reply.anonymous, reply.user) },
          };
        }),
        creator: {
          ...this.getCreatorInfo(e.anonymous, e.user),
        },
      };
    });

    return instanceToPlain(resultDatas);
  }

  //댓글 생성
  async createComment(
    params: paramsTypeAndId,
    body: CreateCommentDto,
    qr: QueryRunner,
  ) {
    //익명으로 댓글을 남길때는 꼭 anonymous 체크하기
    const { userId, content, password, anonymous } = body;

    //유저면 user Entity 없으면 Null
    const user = userId
      ? await this.UserService.getUser({ id: +userId })
      : null;

    const repository = qr.manager.getRepository<CommentModel>(CommentModel);
    const entity = repository.create({
      parentId: params.parentId,
      parentType: params.parentType,
      content,
      user,
      anonymous: !user ? anonymous : null,
      password: !user
        ? await this.authService.hashTransformPassword(password)
        : null,
    });

    // //패스워드 직렬화 제거
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
