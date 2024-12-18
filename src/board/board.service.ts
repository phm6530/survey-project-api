import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { BoardmetaModel } from './entries/BoardmetaModel';
import { QueryRunner, Repository } from 'typeorm';
import { CreateBoardDto } from './dto/CreateBoardDto.dto';
import { JwtPayload } from 'src/auth/type/jwt';
import { USER_ROLE } from 'type/auth';
import { BoardContentsModel } from './entries/BoardContentsModel';
import { InjectRepository } from '@nestjs/typeorm';
import { BoardCategory } from './board.controller';
import { instanceToPlain } from 'class-transformer';
import { AuthService } from 'src/auth/auth.service';
import { UserModel } from 'src/user/entries/user.entity';

@Injectable()
export class BoardService {
  constructor(
    @InjectRepository(BoardmetaModel)
    private readonly boardMetaRepository: Repository<BoardmetaModel>,
    @InjectRepository(BoardContentsModel)
    private readonly boardContentsRepository: Repository<BoardContentsModel>,
    private readonly authService: AuthService,
  ) {}

  // list
  async getList(category: BoardCategory) {
    const getBoardList = await this.boardMetaRepository.find({
      order: {
        createAt: 'DESC',
      },
      where: {
        category,
      },
      relations: ['user'],
    });

    const creatorInital = (anonymous?: string, user?: UserModel) => {
      if (!user) {
        return {
          role: USER_ROLE.ANONYMOUS,
          nickname: anonymous,
        };
      }

      return {
        role: user.role,
        nickname: user.nickname,
      };
    };

    const newList = getBoardList.map((item) => {
      const { anonymous, password: _, user, ...rest } = item;

      return {
        ...rest,
        creator: {
          ...creatorInital(anonymous, user),
        },
      };
    });

    console.log(newList);

    return instanceToPlain(newList);
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
        id: postId,
      },
    });

    if (!isExistPost) {
      throw new NotFoundException('이미 삭제되었거나 잘못된 요청입니다.');
    }

    const result = await this.boardMetaRepository.find({
      where: {
        category,
        id: postId,
      },
      relations: ['user', 'contents'],
    });

    return instanceToPlain(result);
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
    const isExistPost = await this.boardMetaRepository.findOne({
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

    await this.boardMetaRepository.delete(postId);

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

    console.log('metaEntity???', metaEntity);

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
