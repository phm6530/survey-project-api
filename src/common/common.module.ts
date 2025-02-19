import { BadRequestException, Module } from '@nestjs/common';
import { CommonService } from './common.service';
import { CommonController } from './common.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TemplateMetaModel } from 'src/template/entries/template-meta.entity';
import { MulterModule } from '@nestjs/platform-express';
import { extname } from 'path';
import { EmailSerivce } from './service/email.service';

@Module({
  imports: [
    MulterModule.register({
      limits: {
        fieldSize: 1000000,
      },
      //파일 유효성검사
      fileFilter: (req, file, cb) => {
        //확장자 따기 + 소문자 트랜스폼
        const ext = extname(file.originalname).toLowerCase();

        //확장자 맞지않으면 에러 반환
        if (!['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
          return cb(
            new BadRequestException('취급하는 확장자가 아닙니다.'),
            false,
          );
        }

        return cb(null, true);
      },
    }),
    TypeOrmModule.forFeature([TemplateMetaModel]),
  ],
  controllers: [CommonController],
  providers: [CommonService, EmailSerivce],
  exports: [CommonService, EmailSerivce],
})
export class CommonModule {}
