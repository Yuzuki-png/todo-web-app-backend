import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: '有効なメールアドレスを入力してください' })
  @IsNotEmpty({ message: 'メールアドレスは必須です' })
  email: string;

  @IsString({ message: 'パスワードは文字列である必要があります' })
  @IsNotEmpty({ message: 'パスワードは必須です' })
  @MinLength(8, { message: 'パスワードは8文字以上である必要があります' })
  password: string;
}
