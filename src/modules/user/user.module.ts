import { Module } from '@nestjs/common';
import { UserController } from './controllers/user.controller';
import { UserService } from './services/user.service';
import { User, UserSchemaFactory } from '../../entities/user.entity';
import { AppResponseService } from '../../common/reponse/response.service';
import { HashService } from '../../common/hash/hash.service';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      { name: User.name, useFactory: UserSchemaFactory },
    ]),
  ],
  controllers: [UserController],
  providers: [UserService, AppResponseService, HashService],
})
export class UserModule {}
