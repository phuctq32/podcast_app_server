import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from '../services/user.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UpdateUserDto } from '../dto/update-user.dto';
import { ResponseMessage } from '../../../common/decorators/message-response.decorator';
import { User } from '../../../entities/user.entity';
import MongooseClassSerializeInterceptor from '../../../common/interceptor/mongoose-class-serialize.interceptor';
import { ChangePasswordUserDto } from '../dto/change-password-user.dto';
import { CreateChannelDto } from '../dto/create-channel.dto';
import { CreatorGuard } from '../../../common/guards/creator.guard';
import { Requester } from '../../../common/decorators/requester.decorator';
import { JwtPayload } from '../../../utils/jwt/jwt-payload.interface';

@ApiTags('User')
@Controller('users')
@UseInterceptors(MongooseClassSerializeInterceptor(User))
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiBearerAuth('JWT')
  @Get('self')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getProfile(@Requester() requester: JwtPayload) {
    const user = await this.userService.getUserById(requester.userId);

    return { user };
  }

  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  @Patch('/update')
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
  @HttpCode(HttpStatus.CREATED)
  @ResponseMessage('Updated channel successfully')
  async updateChannel(
    @Requester() requester: JwtPayload,
    @Body() dto: CreateChannelDto,
  ) {
    dto.userId = requester.userId;
    return await this.userService.updateChannel(dto);
  }
}
