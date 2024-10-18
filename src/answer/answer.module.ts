import { Module } from '@nestjs/common';
import { AnswerService } from './answer.service';
import { AnswerController } from './answer.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TemplateMetaModel } from 'src/template/entries/template-meta.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TemplateMetaModel])],
  controllers: [AnswerController],
  providers: [AnswerService],
})
export class AnswerModule {}
