import { Module } from '@nestjs/common';
import { User, UserSchemaFactory } from '../../entities/user.entity';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from '../../utils/jwt/jwt.strategy';
import { JWTModule } from '../../utils/jwt/jwt.module';
import { SendEmailModule } from '../../utils/mailer/send-email.module';
import { GoogleStrategy } from './strategies/google.strategy';
import { GoogleOauthGuard } from './guards/google-oauth.guard';
import { HashService } from '../../utils/hash/hash.service';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      { name: User.name, useFactory: UserSchemaFactory },
    ]),
    PassportModule,
    JWTModule,
    SendEmailModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    HashService,
    JwtStrategy,
    GoogleStrategy,
    GoogleOauthGuard,
  ],
  exports: [PassportModule, JwtStrategy, JWTModule],
})
export class AuthModule {}
