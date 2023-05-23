import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../../../schemas/user.schema';
import { Model } from 'mongoose';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async getUserById(id: string) {
    const user = await this.userModel
      .findById(id)
      .select('_id email name avatar');
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }
}
