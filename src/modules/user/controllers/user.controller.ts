import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from '../services/user.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { User } from '../../../entities/user.entity';
import MongooseClassSerializeInterceptor from '../../../common/interceptor/mongoose-class-serialize.interceptor';
import { MongoIdValidationPipe } from '../../../common/validation/mongoid-validation.pipe';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { JwtPayload } from '../../../utils/jwt/jwt-payload.interface';
import { Requester } from '../../../common/decorators/requester.decorator';
import {
  PaginationDto,
  PaginationParams,
} from '../../../common/pagination/pagination.dto';

@ApiTags('User')
@Controller('users')
@UseInterceptors(MongooseClassSerializeInterceptor(User))
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({ summary: 'Get user information by id' })
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getUserById(@Param('id', MongoIdValidationPipe) id: string) {
    const user = await this.userService.getUserById(id);

    return user;
  }

  @ApiOperation({ summary: 'Get Channel info' })
  @ApiBearerAuth('JWT')
  @Get(':id/channel')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getPodcastsByChannelId(
    @Requester() requester: JwtPayload,
    @Param('id', MongoIdValidationPipe) channelId: string,
  ) {
    return await this.userService.getChannel(channelId, requester.userId);
  }

  @ApiOperation({ summary: 'Search channel' })
  @ApiBearerAuth('JWT')
  @Get('/channels/search')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async searchEpisodes(
    @Query('q') searchTerm: string,
    @Query() paginationData: PaginationParams,
  ) {
    const paginationDto = new PaginationDto(paginationData);
    return await this.userService.searchChannel(
      searchTerm,
      paginationDto.getData(),
    );
  }
}
