import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../../../schemas/user.schema';
import { Model } from 'mongoose';
import { UpdateUserDto } from '../dto/update-user.dto';
import { HashService } from '../../../common/hash/hash.service';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly hashService: HashService,
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
    const user = await this.userModel.findById(updateUserDto.id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (updateUserDto.name) {
      user.name = updateUserDto.name;
    }

    if (updateUserDto.avatar) {
      user.avatar = updateUserDto.avatar;
    }

    if (updateUserDto.birthday) {
      user.birthday = updateUserDto.birthday;
    }

    await user.save();

    return user;
  }
}
