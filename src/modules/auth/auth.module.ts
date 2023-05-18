import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../common/database/database.module';
import { User, UserSchema } from '../../schemas/user.schema';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { LocalStrategy } from './strategies/local.strategy';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JWTModule } from '../../common/jwt/jwt.module';
import { LocalAuthGuard } from './guards/local-auth.guard';

@Module({
  imports: [
    DatabaseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    PassportModule,
    JWTModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy, LocalAuthGuard],
  exports: [],
})
export class AuthModule {}
