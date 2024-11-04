import { BadRequestException, Module } from '@nestjs/common';
import { CommonService } from './common.service';
import { CommonController } from './common.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TemplateMetaModel } from 'src/template/entries/template-meta.entity';
import { MulterModule } from '@nestjs/platform-express';
import { extname } from 'path';

@Module({
  imports: [
    MulterModule.register({
      limits: {
        fieldSize: 1000000,
      },
      //파일 유효성검사
      fileFilter: (req, file, cb) => {
        //확장자 따기
        const ext = extname(file.originalname);

        //확장자 맞지않으면 에러 반환
        if (ext !== '.jpg' && ext !== '.jpeg' && ext !== '.png') {
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
  providers: [CommonService],
  exports: [CommonService],
})
export class CommonModule {}
