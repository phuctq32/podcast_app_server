import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../../../schemas/user.schema';
import { Model } from 'mongoose';
import { UpdateUserDto } from '../dto/update-user.dto';
import * as bcrypt from 'bcryptjs';

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

  async updateUser(updateUserDto: UpdateUserDto) {
    const user = await this.userModel
      .findById(updateUserDto.id)
      .select('_id name email password avatar birthday');
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.name = updateUserDto.name;
    user.avatar = updateUserDto.avatar;
    user.birthday = updateUserDto.birthday;

    if (updateUserDto.password) {
      user.password = bcrypt.hashSync(updateUserDto.password, 12);
    }

    await user.save();

    return {
      _id: user._id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      birthday: user.birthday,
    };
  }
}
