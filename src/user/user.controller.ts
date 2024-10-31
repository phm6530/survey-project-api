import { Controller, Get, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { TokenGuard } from 'src/auth/guard/token.guard';
import { User } from 'src/user/decorator/getUser.decorator';
import { UserModel } from 'src/user/entries/user.entity';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('/me')
  @UseGuards(TokenGuard)
  getAuthUserdata(@User() user: UserModel) {
    const { role, email, nickname } = user;

    console.log(user);
    return { role, email, nickname };
  }
}
