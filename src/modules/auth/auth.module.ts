import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../common/database/database.module';
import { User, UserSchema } from '../../schemas/user.schema';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JWTModule } from '../../common/jwt/jwt.module';
import { SendEmailModule } from '../../common/mailer/send-email.module';
import { GoogleStrategy } from './strategies/google.strategy';
import { GoogleOauthGuard } from './guards/google-oauth.guard';
import { AppResponseService } from '../../common/reponse/response.service';

@Module({
  imports: [
    DatabaseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    PassportModule,
    JWTModule,
    SendEmailModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    GoogleStrategy,
    GoogleOauthGuard,
    AppResponseService,
  ],
  exports: [],
})
export class AuthModule {}
