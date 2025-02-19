import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { BoardmetaModel } from './entries/BoardmetaModel';
import { DataSource, QueryRunner, Repository } from 'typeorm';
import { CreateBoardDto } from './dto/CreateBoardDto.dto';
import { JwtPayload } from 'src/auth/type/jwt';
import { USER_ROLE } from 'type/auth';
import { BoardContentsModel } from './entries/BoardContentsModel';
import { InjectRepository } from '@nestjs/typeorm';
import { BoardCategory } from './board.controller';
import { instanceToPlain } from 'class-transformer';
import { AuthService } from 'src/auth/auth.service';
import { CommonService } from 'src/common/common.service';
import { withTransactions } from 'lib/withTransaction.lib';
import { COMMENT_NEED_PATH, CommentService } from 'src/comment/comment.service';

const TargetType = {
  TEMPLATE: 'template',
  BOARD: 'board',
  POST: 'post',
  EVENT: 'event',
} as const;

type TargetUnion = (typeof TargetType)[keyof typeof TargetType];

@Injectable()
export class BoardService {
  constructor(
    @InjectRepository(BoardmetaModel)
    private readonly boardMetaRepository: Repository<BoardmetaModel>,
    @InjectRepository(BoardContentsModel)
    private readonly boardContentsRepository: Repository<BoardContentsModel>,
    private readonly authService: AuthService,
    private readonly commonService: CommonService,
    private readonly dataSource: DataSource,
    private readonly commentService: CommentService,
  ) {}

  async incrementViewCount(boardId: number): Promise<void> {
    await this.boardMetaRepository.increment({ id: boardId }, 'view', 1);
  }

  // 유저
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

  async getViewCount(id: number): Promise<number> {
    const post = await this.boardMetaRepository.findOne({
      where: { id },
      select: ['view'],
    });
    return post?.view ?? 0;
  }

  private transformBoardItem = (item: BoardmetaModel) => {
    const { anonymous, user, createdAt, updateAt, contents, ...rest } = item;

    return {
      ...rest,
      createdAt: this.commonService.transformTimeformat(createdAt),
      updateAt: this.commonService.transformTimeformat(updateAt),
      creator: {
        ...this.getCreatorInfo(anonymous, user),
      },
      ...(contents && { contents: contents.contents }),
    };
  };

  async validateTarget(argType: TargetUnion, targetId: number) {
    if (!Object.values(TargetType).includes(argType)) {
      throw new BadRequestException(
        `Target of type ${argType} with ID ${targetId} does not exist`,
      );
    }
  }

  // list
  async getList(category: BoardCategory, keyword?: string, curPage?: number) {
    const queryBuilder = this.boardMetaRepository
      .createQueryBuilder('board')
      .leftJoinAndSelect('board.user', 'b.user')
      .addSelect(
        (qb) =>
          qb
            .select('COUNT(comment_model.id)', 'totalComments') // 댓글 개수
            .from('comment_model', 'comment_model')
            .where('comment_model.parentId = board.id'), // 조건
        'totalComments', // 서브쿼리 결과 이름
      )
      .where('board.category = :category', { category })
      .orderBy('board.id', 'DESC');

    if (curPage && curPage > 0) {
      queryBuilder.offset((curPage - 1) * 10).limit(10);
    } else {
      queryBuilder.limit(10); // 첫 페이지 처리
    }

    if (keyword) {
      queryBuilder.andWhere('board.title LIKE :keyword', {
        keyword: `%${keyword}%`,
      });
    }

    const getBoards = await queryBuilder.getRawMany();
    const getBoardList = await queryBuilder.getManyAndCount();

    // console.log(getBoards);

    const referchs = getBoards.map((e) => {
      return {
        id: e.board_id,
        updateAt: this.commonService.transformTimeformat(e.board_updateAt),
        createdAt: this.commonService.transformTimeformat(e.board_createdAt),
        title: e.board_title,
        category: e.board_category,
        anonymous: e.board_anonymous,
        view: e.board_view,
        commentCnt: +e.totalComments,
        creator: {
          ...this.getCreatorInfo(e.board_anonymous, {
            role: e['b.user_role'],
            nickname: e['b.user_nickname'],
            email: e['b.user_email'],
          }),
        },
      };
    });

    return instanceToPlain([referchs, getBoardList[1]]);
  }

  private async getAnonymousFields(
    role: USER_ROLE,
    fields: { anonymous: string; password: string },
  ) {
    return role === USER_ROLE.ANONYMOUS
      ? {
          anonymous: fields.anonymous,
          password: await this.authService.hashTransformPassword(
            fields.password,
          ),
        }
      : { anonymous: null, password: null };
  }

  async getDetailPost({
    category,
    postId,
  }: {
    category: BoardCategory;
    postId: number;
  }) {
    const isExistPost = await this.boardMetaRepository.findOne({
      where: {
        category,
        id: postId,
      },
      relations: ['contents', 'user'],
    });

    if (!isExistPost) {
      throw new NotFoundException('이미 삭제되었거나 잘못된 요청입니다.');
    }
    return instanceToPlain(this.transformBoardItem(isExistPost));
  }

  //Delete
  async deletePost({
    body,
    category,
    postId,
    jwtUser,
  }: {
    body: { anonymous?: string; password?: string };
    category: BoardCategory;
    postId: number;
    jwtUser: JwtPayload;
  }) {
    // 삭제 트랜잭션
    const transaction = new withTransactions(this.dataSource);
    await transaction.execute(async (qr: QueryRunner) => {
      const BoardRepo =
        qr.manager.getRepository<BoardmetaModel>(BoardmetaModel);

      const isExistPost = await BoardRepo.findOne({
        where: {
          category,
          id: postId,
        },
        relations: ['user'],
      });

      if (!isExistPost) {
        throw new NotFoundException('이미 삭제되었거나 잘못된 요청입니다.');
      }

      const postCreator = isExistPost.user;
      const postRole = postCreator?.role || USER_ROLE.ANONYMOUS;

      switch (postRole) {
        case USER_ROLE.ANONYMOUS:
          // 익명 게시물 - 비밀번호 검증
          if (!body.password) {
            throw new BadRequestException('비밀번호를 입력해주세요.');
          }
          await this.authService.verifyPassword(
            body.password,
            isExistPost.password,
          );
          break;

        case USER_ROLE.USER:
        case USER_ROLE.ADMIN:
          // 회원 게시물 - 현재 사용자가 작성자이거나 관리자여야 함
          if (!jwtUser) {
            throw new UnauthorizedException('로그인이 필요합니다.');
          }

          if (jwtUser.role === USER_ROLE.ADMIN) {
            // 관리자는 모든 게시물 삭제 가능
            break;
          }

          if (jwtUser.email !== postCreator.email) {
            throw new UnauthorizedException('삭제 권한이 없습니다.');
          }
          break;

        default:
          throw new ForbiddenException('알 수 없는 권한입니다.');
      }

      await this.commentService.deleteRelationComment(
        { parentId: postId, parentType: COMMENT_NEED_PATH.BOARD },
        qr,
      );

      await BoardRepo.delete(postId);
    });
    return {
      statusCode: 200,
      message: 'success',
    };
  }

  // MetaData
  async createBoard(
    qr: QueryRunner,
    data: {
      body: CreateBoardDto;
      category: string;
      user: JwtPayload;
    },
  ) {
    const boardMetaRepository =
      qr.manager.getRepository<BoardmetaModel>(BoardmetaModel);

    const boardContentsRepository =
      qr.manager.getRepository<BoardContentsModel>(BoardContentsModel);

    const { body, user, category } = data;
    const { title, anonymous, password, contents } = body;
    const role = user?.role || (USER_ROLE.ANONYMOUS as USER_ROLE);

    //User Mapping
    const userMapping = {
      [USER_ROLE.ADMIN]: { id: user?.id },
      [USER_ROLE.USER]: { id: user?.id },
      [USER_ROLE.ANONYMOUS]: null,
    };

    const metaEntity = boardMetaRepository.create({
      title,
      user: userMapping[role],
      category,
      ...(await this.getAnonymousFields(role, { anonymous, password })),
    });

    const result = await boardMetaRepository.save(metaEntity);

    const contentsEntity = boardContentsRepository.create({
      boardMeta: result,
      contents,
    });

    await boardContentsRepository.save(contentsEntity);

    return {
      statusCode: 201,
      message: 'success',
    };
  }
}
