import { Body, Controller, Post } from '@nestjs/common';
import { ContactService } from './contact.service';
import { SendMailDto } from 'src/contact/dto/post-mail.dto';

@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post()
  postMail(@Body() body: SendMailDto) {
    return this.contactService.sendMail(body);
  }
}
