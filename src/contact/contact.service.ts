import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SendMailDto } from 'src/contact/dto/post-mail.dto';
import * as nodemailer from 'nodemailer';
import 'dayjs/locale/ko';

@Injectable()
export class ContactService {
  constructor(private readonly configService: ConfigService) {}

  // 네이버메일 보내기
  async sendMail({ name, digit, textarea }: SendMailDto) {
    const mailConfig = nodemailer.createTransport({
      service: this.configService.get<string>('MAIL_SERVICE'),
      auth: {
        user: this.configService.get<string>('MAIL_ID'),
        pass: this.configService.get<string>('MAIL_PASSWORD'),
      },
    });

    const result = await mailConfig.sendMail({
      from: process.env.MAIL_ID,
      to: process.env.MAIL_ID,
      subject: '[Project-D] 문의메일',
      html: `
        <h1>문의사항</h1>
        <br><br>
        <p>이름 : ${name}</p>
        <p>연락처 : ${digit} </p>
        <p>${textarea}</p>
        <br>
      <p style="font-size:12px; opacity : .7;">
    `,
    });

    if (!result || result.rejected.length > 0) {
      throw new BadRequestException('메일 전송에 실패하였습니다.');
    }

    return {
      message: 'success',
    };
  }
}
