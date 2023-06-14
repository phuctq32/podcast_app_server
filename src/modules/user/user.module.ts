import { Module } from '@nestjs/common';
import { UserController } from './controllers/user.controller';
import { UserService } from './services/user.service';
import { User, UserSchemaFactory } from '../../entities/user.entity';
import { HashService } from '../../utils/hash/hash.service';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      { name: User.name, useFactory: UserSchemaFactory },
    ]),
  ],
  controllers: [UserController],
  providers: [UserService, HashService],
  exports: [MongooseModule],
})
export class UserModule {}
