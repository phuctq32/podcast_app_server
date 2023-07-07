import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from '../../user/services/user.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { Requester } from '../../../common/decorators/requester.decorator';
import { JwtPayload } from '../../../utils/jwt/jwt-payload.interface';
import MongooseClassSerializeInterceptor from '../../../common/interceptor/mongoose-class-serialize.interceptor';
import { User } from '../../../entities/user.entity';
import { ResponseMessage } from '../../../common/decorators/message-response.decorator';
import { UpdateUserDto } from '../../user/dto/update-user.dto';
import { ChangePasswordUserDto } from '../../user/dto/change-password-user.dto';
import { CreateChannelDto } from '../../user/dto/create-channel.dto';
import { CreatorGuard } from '../../../common/guards/creator.guard';
import { EpisodeService } from '../../episode/service/episode.service';
import { Episode } from '../../../entities/episode.entity';
import { MongoIdValidationPipe } from '../../../common/validation/mongoid-validation.pipe';
import {
  PaginationDto,
  PaginationParams,
} from '../../../common/pagination/pagination.dto';
import { Podcast } from '../../../entities/podcast.entity';

@ApiTags('Self (The APIs for interacting with resource related to requester)')
@Controller('users/self')
export class SelfController {
  constructor(
    private readonly userService: UserService,
    private readonly episodeService: EpisodeService,
  ) {}

  @ApiOperation({ summary: 'Get the profile information' })
  @ApiBearerAuth('JWT')
  @Get()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(MongooseClassSerializeInterceptor(User))
  @HttpCode(HttpStatus.OK)
  async getProfile(@Requester() requester: JwtPayload) {
    return this.userService.getUserById(requester.userId);
  }

  @ApiOperation({ summary: 'Update profile' })
  @ApiBearerAuth('JWT')
  @Patch()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(MongooseClassSerializeInterceptor(User))
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Update user successfully')
  async updateProfile(
    @Requester() requester: JwtPayload,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    updateUserDto.id = requester.userId;
    const user = await this.userService.updateUser(updateUserDto);

    return user;
  }

  @ApiOperation({ summary: 'Change password' })
  @ApiBearerAuth('JWT')
  @Patch('change-password')
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
  @ApiOperation({
    summary: 'Create a channel',
    description:
      'A user can have only one channel. If user have one, can not create',
  })
  @ApiBearerAuth('JWT')
  @Post('channel')
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

  @ApiOperation({ summary: 'Update channel information' })
  @ApiBearerAuth('JWT')
  @Patch('channel')
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

  // Listened episodes
  @ApiOperation({ summary: 'Get history listened episodes' })
  @ApiBearerAuth('JWT')
  @Get('/listened-episodes')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(MongooseClassSerializeInterceptor(Episode))
  @HttpCode(HttpStatus.OK)
  async getListenedEpisodes(
    @Requester() requester: JwtPayload,
    @Query() paginationData: PaginationParams,
  ) {
    const paginationDto = new PaginationDto(paginationData);
    return await this.episodeService.getListenedEpisodes(
      requester.userId,
      paginationDto.getData(),
    );
  }

  @ApiOperation({
    summary: 'Add episode to history',
    description:
      'Increase listen frequency of episodes. A user can listen multiple time',
  })
  @ApiBearerAuth('JWT')
  @Post('/listened-episodes/:id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(MongooseClassSerializeInterceptor(Episode))
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Increased listening frequency')
  async listenEpisode(
    @Requester() requester: JwtPayload,
    @Param('id', MongoIdValidationPipe) episodeId: string,
  ) {
    return await this.episodeService.listen(episodeId, requester.userId);
  }

  @ApiOperation({
    summary: 'Remove all episode from history',
  })
  @ApiBearerAuth('JWT')
  @Delete('listened-episodes')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(MongooseClassSerializeInterceptor(Episode))
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Removed all episodes from listened list')
  async removeAllEpisodeFromListenedList(@Requester() requester: JwtPayload) {
    return await this.episodeService.removeAllFromListened(requester.userId);
  }

  @ApiOperation({
    summary: 'Remove one episode from history',
    description: 'If the episode not exist in listened list, can not remove',
  })
  @ApiBearerAuth('JWT')
  @Delete('listened-episodes/:id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(MongooseClassSerializeInterceptor(Episode))
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Removed episode from listened list')
  async removeEpisodeFromListenedList(
    @Requester() requester: JwtPayload,
    @Param('id', MongoIdValidationPipe) episodeId: string,
  ) {
    return await this.episodeService.removeFromListened(
      episodeId,
      requester.userId,
    );
  }

  // favorite
  @ApiOperation({ summary: 'Get favorite episodes' })
  @ApiBearerAuth('JWT')
  @Get('favorite-episodes')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(MongooseClassSerializeInterceptor(Episode))
  @HttpCode(HttpStatus.OK)
  async getFavoriteList(@Requester() requester: JwtPayload) {
    return await this.episodeService.getFavorite(requester.userId);
  }

  @ApiOperation({
    summary: 'Add an episode to favorite list',
    description:
      'An episode can only add 1 times</br>If the episode existed in favorite list, can not add',
  })
  @ApiBearerAuth('JWT')
  @Post('favorite-episodes/:id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(MongooseClassSerializeInterceptor(Episode))
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Added episode to favorite list')
  async addEpisodeToFavoriteList(
    @Requester() requester: JwtPayload,
    @Param('id', MongoIdValidationPipe) episodeId: string,
  ) {
    return await this.episodeService.addToFavorite(episodeId, requester.userId);
  }

  @ApiOperation({
    summary: 'Remove all episode from favorite list',
  })
  @ApiBearerAuth('JWT')
  @Delete('favorite-episodes')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(MongooseClassSerializeInterceptor(Episode))
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Removed all episodes from favorite list')
  async removeAllEpisodeFromFavoriteList(@Requester() requester: JwtPayload) {
    return await this.episodeService.removeAllFromFavorite(requester.userId);
  }

  @ApiOperation({
    summary: 'Remove one episode from favorite list',
    description: 'If the episode not exist in favorite list, can not remove',
  })
  @ApiBearerAuth('JWT')
  @Delete('favorite-episodes/:id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(MongooseClassSerializeInterceptor(Episode))
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Removed episode from favorite list')
  async removeEpisodeFromFavoriteList(
    @Requester() requester: JwtPayload,
    @Param('id', MongoIdValidationPipe) episodeId: string,
  ) {
    return await this.episodeService.removeFromFavorite(
      episodeId,
      requester.userId,
    );
  }

  // Search history
  @ApiOperation({ summary: 'Get search history' })
  @ApiBearerAuth('JWT')
  @ApiResponse({ type: User })
  @Get('search-history')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getSearchHistory(@Requester() requester: JwtPayload) {
    return await this.userService.getSearchHistory(requester.userId);
  }

  @ApiOperation({ summary: 'Remove a search term from search history' })
  @ApiBearerAuth('JWT')
  @Delete('search-history/:searchTerm')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Cleared search term')
  async removeFromSearchHistory(
    @Requester() requester: JwtPayload,
    @Param('searchTerm') searchTerm: string,
  ) {
    return await this.userService.removeFromSearchHistory(
      requester.userId,
      searchTerm.trim(),
    );
  }

  @ApiOperation({ summary: 'Remove all from search history' })
  @ApiBearerAuth('JWT')
  @Delete('search-history')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Cleared search history')
  async removeAllFromSearchHistory(@Requester() requester: JwtPayload) {
    return await this.userService.removeAllFromSearchHistory(requester.userId);
  }

  @ApiOperation({ summary: 'Get current user channel info' })
  @ApiBearerAuth('JWT')
  @Get('channel')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(MongooseClassSerializeInterceptor(User))
  @HttpCode(HttpStatus.OK)
  async getPodcastsByChannelId(@Requester() requester: JwtPayload) {
    return await this.userService.getChannel(
      requester.userId,
      requester.userId,
    );
  }

  @ApiOperation({ summary: 'Get subscribe podcast' })
  @ApiBearerAuth('JWT')
  @Get('subscribed-podcasts')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(MongooseClassSerializeInterceptor(Podcast))
  @HttpCode(HttpStatus.OK)
  async getSubscribedPodcasts(
    @Requester() requester: JwtPayload,
    @Query() paginationData: PaginationParams,
  ) {
    const paginationDto = new PaginationDto(paginationData);
    return await this.userService.getSubscribedPodcasts(
      requester.userId,
      paginationDto.getData(),
    );
  }
}
