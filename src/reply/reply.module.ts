import { Module } from '@nestjs/common';
import { ReplyService } from './reply.service';
import { ReplyController } from './reply.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReplyModel } from 'src/reply/entries/reply.entity';
import { AuthModule } from 'src/auth/auth.module';
import { CommentModel } from 'src/comment/entries/comment.entity';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [
    JwtModule.register({}),
    TypeOrmModule.forFeature([ReplyModel, CommentModel]),
    AuthModule,
    UserModule,
  ],
  controllers: [ReplyController],
  providers: [ReplyService],
})
export class ReplyModule {}
