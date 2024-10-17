import { Module } from '@nestjs/common';
import { TemplateService } from './template.service';
import { TemplateController } from './template.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TemplateMetaModel } from 'src/template/entries/template-meta.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TemplateMetaModel])],
  controllers: [TemplateController],
  providers: [TemplateService],
})
export class TemplateModule {}
