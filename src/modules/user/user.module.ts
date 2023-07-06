import { Module } from '@nestjs/common';
import { UserController } from './controllers/user.controller';
import { UserService } from './services/user.service';
import { User, UserSchemaFactory } from '../../entities/user.entity';
import { HashService } from '../../utils/hash/hash.service';
import { MongooseModule } from '@nestjs/mongoose';
import { JWTModule } from '../../utils/jwt/jwt.module';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      { name: User.name, useFactory: UserSchemaFactory },
    ]),
    JWTModule,
  ],
  controllers: [UserController],
  providers: [UserService, HashService],
  exports: [MongooseModule, UserService],
})
export class UserModule {}
