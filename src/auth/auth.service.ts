import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcryptjs';
import { ConfigService } from '@nestjs/config';
import { RefreshToken } from './entities/refresh-token.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
    private readonly jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  // 新規ユーザー登録
  async register(createUserDto: CreateUserDto) {
    const { email, password, name } = createUserDto;

    // メールアドレスが既に登録されているかチェック
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });
    if (existingUser) {
      throw new ConflictException('このメールアドレスは既に使用されています');
    }

    // パスワードをハッシュ化
    const hashedPassword = await bcrypt.hash(password, 10);

    // ユーザーを保存
    const user = this.userRepository.create({
      email,
      password: hashedPassword,
      name,
    });

    await this.userRepository.save(user);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...result } = user;
    return result;
  }

  // ログイン処理
  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // メールアドレスでユーザーを検索
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new UnauthorizedException(
        'メールアドレスまたはパスワードが正しくありません',
      );
    }

    // パスワードを検証
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException(
        'メールアドレスまたはパスワードが正しくありません',
      );
    }

    // JWTトークンとリフレッシュトークンを生成
    const tokens = await this.generateTokens(user);

    return tokens;
  }

  // ユーザープロフィール取得
  async getProfile(id: number) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new UnauthorizedException('ユーザーが見つかりません');
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = user;
    return result;
  }

  // トークンの生成
  async generateTokens(user: User) {
    const payload = {
      sub: user.id,
      email: user.email,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET_KEY'),
      expiresIn: this.configService.get<string>('JWT_EXPIRES_IN'),
    });

    // リフレッシュトークンを生成
    const refreshToken = uuidv4();
    const refreshTokenExpires = new Date();
    refreshTokenExpires.setDate(refreshTokenExpires.getDate() + 7); // 7日間有効

    // 既存のリフレッシュトークンを無効化
    await this.refreshTokenRepository.update(
      { userId: user.id, isRevoked: false },
      { isRevoked: true },
    );

    // 新しいリフレッシュトークンを保存
    const newRefreshToken = this.refreshTokenRepository.create({
      token: refreshToken,
      expiresAt: refreshTokenExpires,
      userId: user.id,
    });
    await this.refreshTokenRepository.save(newRefreshToken);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  // リフレッシュトークンでトークンを更新
  async refreshTokens(refreshToken: string) {
    const token = await this.refreshTokenRepository.findOne({
      where: { token: refreshToken, isRevoked: false },
      relations: ['user'],
    });

    if (!token || new Date() > token.expiresAt) {
      throw new ForbiddenException('リフレッシュトークンが無効です');
    }

    return this.generateTokens(token.user);
  }
}
