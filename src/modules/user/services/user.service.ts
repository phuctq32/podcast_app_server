import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../../../entities/user.entity';
import { Model } from 'mongoose';
import { UpdateUserDto } from '../dto/update-user.dto';
import { HashService } from '../../../utils/hash/hash.service';
import { ChangePasswordUserDto } from '../dto/change-password-user.dto';
import { CreateChannelDto } from '../dto/create-channel.dto';
import { JwtPayload } from '../../../utils/jwt/jwt-payload.interface';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UserService {
  private readonly logger: Logger = new Logger(UserService.name);
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly hashService: HashService,
    private readonly jwtService: JwtService,
  ) {}

  async getUserById(id: string) {
    this.logger.log(`In func ${this.getUserById.name}`);
    const user = await this.userModel.findOne({ _id: id });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateUser(updateUserDto: UpdateUserDto) {
    this.logger.log(`In func ${this.updateUser.name}`);
    const user = await this.getUserById(updateUserDto.id);

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

  async changeUserPassword(dto: ChangePasswordUserDto) {
    this.logger.log(`In func ${this.changeUserPassword.name}`);
    const user = await this.getUserById(dto.id);

    // Check valid current password
    if (!this.hashService.compare(dto.currentPassword, user.password)) {
      throw new BadRequestException('Current password wrong');
    }

    // Check condition: new password must be different than the current one
    if (dto.newPassword === dto.currentPassword) {
      throw new BadRequestException(
        'New password must be different than to current',
      );
    }

    user.password = this.hashService.hash(dto.newPassword);

    await user.save();

    return user;
  }

  async createChannel(dto: CreateChannelDto) {
    this.logger.log(`In func ${this.createChannel.name}`);
    const user = await this.getUserById(dto.userId);

    if (user.is_creator) {
      throw new BadRequestException('Your channel already exist');
    }

    user.is_creator = true;
    user.channel_name = dto.name;
    await user.save();

    const payload: JwtPayload = {
      userId: user._id.toString(),
      email: user.email,
      isCreator: user.is_creator,
    };

    const token = this.jwtService.sign(payload);

    return { user, token };
  }

  async updateChannel(dto: CreateChannelDto) {
    this.logger.log(`In func ${this.updateChannel.name}`);
    const user = await this.getUserById(dto.userId);

    user.channel_name = dto.name;
    await user.save();

    return user;
  }

  async getSearchHistory(userId: string) {
    this.logger.log(`In func ${this.getSearchHistory.name}`);
    const user = await this.getUserById(userId);

    return user.search_history;
  }

  async removeAnItemFromSearchHistory(userId: string, searchStr: string) {
    this.logger.log(`In func ${this.removeAnItemFromSearchHistory.name}`);
  }
}
