import { Controller, Get, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { TokenGuard } from 'src/auth/guard/token.guard';
import { User } from 'src/user/decorator/getUser.decorator';
import { UserModel } from 'src/user/entries/user.entity';
import { instanceToPlain } from 'class-transformer';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('/me')
  @UseGuards(TokenGuard)
  getAuthUserdata(@User() user: UserModel) {
    const userData = this.userService.getUser({
      id: user.id,
      email: user.email,
    });
    return instanceToPlain(userData);
  }

  // 내가만든 템플릿 리스트
  @Get('/me/contents')
  @UseGuards(TokenGuard)
  getMycontents(@User() user: UserModel) {
    return this.userService.getMyContents({ id: +user.id });
  }
}
