import { Module } from '@nestjs/common';
import { TemplateService } from './template.service';
import { TemplateController } from './template.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TemplateMetaModel } from 'src/template/entries/template-meta.entity';
import { JwtModule } from '@nestjs/jwt';
import { CommonModule } from 'src/common/common.module';

@Module({
  imports: [
    JwtModule.register({}),
    TypeOrmModule.forFeature([TemplateMetaModel]),
    CommonModule,
  ],
  exports: [TemplateService],
  controllers: [TemplateController],
  providers: [TemplateService],
})
export class TemplateModule {}
