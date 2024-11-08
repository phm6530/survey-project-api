import {
  Controller,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { CommonService } from './common.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('common')
export class CommonController {
  constructor(private readonly commonService: CommonService) {}

  @Post('image/:key')
  //file인지 files인지 확인...
  @UseInterceptors(FileInterceptor('image'))
  async UploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Param() params: { key: string }, //Template Id
  ) {
    const result = await this.commonService.uploadFileSupabase(
      file,
      params.key,
    );

    return {
      supabase_storage_imgurl: result,
    };
  }
}
