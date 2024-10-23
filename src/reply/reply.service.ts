import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { instanceToPlain } from 'class-transformer';
import { AuthService } from 'src/auth/auth.service';
import { CommentModel } from 'src/comment/entries/comment.entity';
import { CreateReplyDto } from 'src/reply/dto/createReply.dto';
import { ReplyModel } from 'src/reply/entries/reply.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ReplyService {
  constructor(
    @InjectRepository(ReplyModel)
    private readonly replyRepository: Repository<ReplyModel>,
    @InjectRepository(CommentModel)
    private readonly commentRepository: Repository<CommentModel>,
    private readonly authService: AuthService,
  ) {}

  async createReply(
    commentId: number,
    body: CreateReplyDto,
    user?: { id: number },
  ) {
    const { reply, password } = body;

    const isExistComment = await this.commentRepository.findOne({
      where: { id: commentId },
    });

    if (!isExistComment) {
      throw new BadRequestException('error..');
    }

    const entity = this.replyRepository.create({
      reply,
      password: !user
        ? await this.authService.hashTransformPassword(password)
        : null,
      user: user ? { id: user.id } : null,
      comment: { id: commentId },
    });
    return instanceToPlain(await this.replyRepository.save(entity));
  }

  async deleteReply(id: number, password: string, user?: { id: number }) {
    const isExistReply = await this.replyRepository.findOne({
      where: { id },
    });

    if (!isExistReply) {
      throw new NotFoundException('이미 삭제되었거나 잘못된 요청입니다.');
    }

    if (!user) {
      await this.authService.verifyPassword(password, isExistReply.password);
    }

    return await this.replyRepository.delete({ id });
  }
}
