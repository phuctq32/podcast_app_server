import { Module } from '@nestjs/common';
import { UserController } from './controllers/user.controller';
import { UserService } from './services/user.service';
import { DatabaseModule } from '../../common/database/database.module';
import { User, UserSchema } from '../../schemas/user.schema';
import { AppResponseService } from '../../common/reponse/response.service';

@Module({
  imports: [
    DatabaseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [UserController],
  providers: [UserService, AppResponseService],
})
export class UserModule {}
