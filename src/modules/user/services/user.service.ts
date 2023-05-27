import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../../../schemas/user.schema';
import { Model } from 'mongoose';
import { UpdateUserDto } from '../dto/update-user.dto';
import { HashService } from '../../../common/hash/hash.service';
import { ChangePasswordUserDto } from '../dto/change-password-user.dto';

@Injectable()
export class UserService {
  private readonly logger: Logger = new Logger(UserService.name);
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly hashService: HashService,
  ) {}

  async getUserById(id: string) {
    this.logger.log(`In func ${this.getUserById.name}`);
    const user = await this.userModel
      .findById(id)
      .select('_id email name avatar');
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateUser(updateUserDto: UpdateUserDto) {
    this.logger.log(`In func ${this.updateUser.name}`);
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

  async changeUserPassword(dto: ChangePasswordUserDto) {
    this.logger.log(`In func ${this.changeUserPassword.name}`);
    const user = await this.userModel.findById(dto.id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

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

    return { user };
  }
}
