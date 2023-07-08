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
import { PaginationDto } from '../../../common/pagination/pagination.dto';
import { PaginationService } from '../../../common/pagination/pagination.service';
import { RemoveAccentsService } from '../../../common/remove-accents.service';
import { Status } from '../../../common/constants';

@Injectable()
export class UserService {
  private readonly logger: Logger = new Logger(UserService.name);
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly hashService: HashService,
    private readonly jwtService: JwtService,
    private readonly paginationService: PaginationService,
    private readonly removeAccentsService: RemoveAccentsService,
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

  async getChannel(channelId: string, requesterId: string) {
    const user = await this.getUserById(channelId);
    await user.populate({
      path: 'podcasts',
      match: {
        status: Status.ACTIVE,
      },
      populate: {
        path: 'author category',
      },
    });
    for (let i = 0; i < user.podcasts.length; i++) {
      await user.podcasts[i].calcViews();
      await user.podcasts[i].checkSubscription(requesterId);
    }

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

  async searchChannel(searchTerm: string, paginationDto: PaginationDto) {
    const searchStr =
      this.removeAccentsService.removeVietnameseAccents(searchTerm);
    if (!paginationDto) {
      const users = await this.userModel
        .find(
          {
            is_creator: true,
            $text: {
              $search: searchStr,
              $caseSensitive: false,
              $diacriticSensitive: false,
            },
          },
          { score: { $meta: 'textScore' } },
        )
        .sort({ score: { $meta: 'textScore' } });
      return users;
    }

    const users = await this.userModel
      .find(
        {
          is_creator: true,
          $text: {
            $search: searchStr,
            $caseSensitive: false,
            $diacriticSensitive: false,
          },
        },
        { score: { $meta: 'textScore' } },
      )
      .sort({ score: { $meta: 'textScore' } })
      .skip((paginationDto.offset - 1) * paginationDto.limit)
      .limit(paginationDto.limit);

    const usersTotalCount = await this.userModel.countDocuments({
      is_creator: true,
      $text: {
        $search: this.removeAccentsService.removeVietnameseAccents(searchTerm),
        $caseSensitive: false,
        $diacriticSensitive: false,
      },
    });

    return {
      data: users,
      pagination: this.paginationService.getInformation(
        paginationDto,
        usersTotalCount,
      ),
    };
  }

  async getSearchHistory(userId: string) {
    this.logger.log(`In func ${this.getSearchHistory.name}`);
    const user = await this.getUserById(userId);

    return user.search_history.reverse();
  }

  async removeFromSearchHistory(userId: string, searchTerm: string) {
    this.logger.log(`In func ${this.removeFromSearchHistory.name}`);
    const user = await this.userModel.findOne({ _id: userId });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (!user.search_history.includes(searchTerm)) {
      throw new BadRequestException(
        `${searchTerm} not exists in search history`,
      );
    }
    user.search_history = user.search_history.filter((s) => s !== searchTerm);
    await user.save();

    return user.search_history.reverse();
  }

  async removeAllFromSearchHistory(userId: string) {
    this.logger.log(`In func ${this.removeAllFromSearchHistory.name}`);
    const user = await this.userModel.findOne({ _id: userId });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.search_history = [];
    await user.save();

    return user.search_history;
  }

  async getSubscribedPodcasts(userId: string, paginationDto: PaginationDto) {
    const user = await this.userModel.findOne({ _id: userId });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.subscribed_podcasts = user.subscribed_podcasts.reverse();
    await user.populate({
      path: 'subscribed_podcasts',
      match: {
        status: Status.ACTIVE,
      },
    });
    const subscribedPodcastsTotalCount = user.subscribed_podcasts.length;
    user.depopulate('subscribed_podcasts');

    if (!paginationDto) {
      await user.populate({
        path: 'subscribed_podcasts',
        match: {
          status: Status.ACTIVE,
        },
        populate: {
          path: 'author category',
        },
      });
      for (let i = 0; i < user.subscribed_podcasts.length; i++) {
        await user.subscribed_podcasts[i].calcViews();
        await user.subscribed_podcasts[i].checkSubscription(userId);
      }

      return user.subscribed_podcasts;
    }

    await user.populate({
      path: 'subscribed_podcasts',
      match: {
        status: Status.ACTIVE,
      },
      options: {
        skip: (paginationDto.offset - 1) * paginationDto.limit,
        limit: paginationDto.limit,
      },
      populate: {
        path: 'author category',
      },
    });
    for (let i = 0; i < user.subscribed_podcasts.length; i++) {
      await user.subscribed_podcasts[i].calcViews();
      await user.subscribed_podcasts[i].checkSubscription(userId);
    }

    return {
      data: user.subscribed_podcasts,
      pagination: this.paginationService.getInformation(
        paginationDto,
        subscribedPodcastsTotalCount,
      ),
    };
  }
}
