import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from '../services/user.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UpdateUserDto } from '../dto/update-user.dto';
import { ResponseMessage } from '../../../common/decorators/message-response.decorator';
import { User } from '../../../entities/user.entity';
import { ChangePasswordUserDto } from '../dto/change-password-user.dto';
import { CreateChannelDto } from '../dto/create-channel.dto';
import { CreatorGuard } from '../../../common/guards/creator.guard';
import { Requester } from '../../../common/decorators/requester.decorator';
import { JwtPayload } from '../../../utils/jwt/jwt-payload.interface';
import MongooseClassSerializeInterceptor from '../../../common/interceptor/mongoose-class-serialize.interceptor';
import { CreatePlaylistDto } from '../dto/create-playlist.dto';
import { Playlist } from '../../../entities/playlist.entity';

@ApiTags('User')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiBearerAuth('JWT')
  @Get('self')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(MongooseClassSerializeInterceptor(User))
  async getProfile(@Requester() requester: JwtPayload) {
    const user = await this.userService.getUserById(requester.userId);

    return { user };
  }

  @ApiBearerAuth('JWT')
  @Patch('/update')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(MongooseClassSerializeInterceptor(User))
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Update user successfully')
  async updateUser(
    @Requester() requester: JwtPayload,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    updateUserDto.id = requester.userId;
    const user = await this.userService.updateUser(updateUserDto);

    return { user };
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getUserById(@Param('id') id: string) {
    const user = await this.userService.getUserById(id);

    return { user };
  }

  @ApiBearerAuth('JWT')
  @Patch('self/change-password')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(MongooseClassSerializeInterceptor(User))
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Change password successfully')
  async changePassword(
    @Requester() requester: JwtPayload,
    @Body() dto: ChangePasswordUserDto,
  ) {
    dto.id = requester.userId;
    return await this.userService.changeUserPassword(dto);
  }

  // Channel
  @ApiBearerAuth('JWT')
  @Patch('self/channel/create')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(MongooseClassSerializeInterceptor(User))
  @HttpCode(HttpStatus.CREATED)
  @ResponseMessage('Created channel successfully')
  async createChannel(
    @Requester() requester: JwtPayload,
    @Body() dto: CreateChannelDto,
  ) {
    dto.userId = requester.userId;
    return await this.userService.createChannel(dto);
  }

  @ApiBearerAuth('JWT')
  @Patch('self/channel/update')
  @UseGuards(JwtAuthGuard, CreatorGuard)
  @UseInterceptors(MongooseClassSerializeInterceptor(User))
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Updated channel successfully')
  async updateChannel(
    @Requester() requester: JwtPayload,
    @Body() dto: CreateChannelDto,
  ) {
    dto.userId = requester.userId;
    return await this.userService.updateChannel(dto);
  }

  // Playlist
  @ApiBearerAuth('JWT')
  @Post('self/playlists')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(MongooseClassSerializeInterceptor(Playlist))
  @HttpCode(HttpStatus.CREATED)
  @ResponseMessage('Created playlist successfully')
  async createPlaylist(
    @Requester() requester: JwtPayload,
    @Body() dto: CreatePlaylistDto,
  ) {
    dto.userId = requester.userId;
    return await this.userService.createPlaylist(dto);
  }
}
