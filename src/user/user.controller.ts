import {
  Controller,
  Get,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { TokenGuard } from 'src/auth/guard/token.guard';
import { UserInToken } from 'src/user/decorator/getUser.decorator';
import { UserModel } from 'src/user/entries/user.entity';
import { instanceToPlain, plainToInstance } from 'class-transformer';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('/me')
  @UseGuards(TokenGuard)
  async getAuthUserdata(@UserInToken() user: UserModel) {
    const userData = await this.userService.getUser({
      id: user.id,
      email: user.email,
    });

    const userInstance = plainToInstance(UserModel, userData);
    return instanceToPlain(userInstance);
  }

  // 내가만든 템플릿 리스트
  @Get('/me/contents')
  @UseGuards(TokenGuard)
  getMycontents(@UserInToken() user: UserModel) {
    console.count('test');
    return this.userService.getMyContents({ id: +user.id });
  }
}
