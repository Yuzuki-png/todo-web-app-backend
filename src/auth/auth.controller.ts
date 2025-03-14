import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // 新規ユーザー登録
  @Post('register')
  register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  // ログイン
  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  // 認証が必要なエンドポイント（ユーザー情報取得）
  @UseGuards(JwtAuthGuard)
  @Get('me')
  getProfile(@Request() req) {
    return this.authService.getProfile(req.user.id);
  }

  // リフレッシュトークンでアクセストークンを更新
  @Post('refresh')
  refreshTokens(@Body('refresh_token') refreshToken: string) {
    return this.authService.refreshTokens(refreshToken);
  }
}
