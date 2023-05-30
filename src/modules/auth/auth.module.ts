import { Module } from '@nestjs/common';
import { User, UserSchemaFactory } from '../../entities/user.entity';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from '../../common/jwt/jwt.strategy';
import { JWTModule } from '../../common/jwt/jwt.module';
import { SendEmailModule } from '../../common/mailer/send-email.module';
import { GoogleStrategy } from './strategies/google.strategy';
import { GoogleOauthGuard } from './guards/google-oauth.guard';
import { AppResponseService } from '../../common/reponse/response.service';
import { HashService } from '../../common/hash/hash.service';
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
    AppResponseService,
  ],
  exports: [PassportModule, JwtStrategy, JWTModule],
})
export class AuthModule {}
