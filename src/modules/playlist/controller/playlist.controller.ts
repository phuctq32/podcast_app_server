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
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { PlaylistService } from '../service/playlist.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import MongooseClassSerializeInterceptor from '../../../common/interceptor/mongoose-class-serialize.interceptor';
import { Playlist } from '../../../entities/playlist.entity';
import { ResponseMessage } from '../../../common/decorators/message-response.decorator';
import { Requester } from '../../../common/decorators/requester.decorator';
import { JwtPayload } from '../../../utils/jwt/jwt-payload.interface';
import { CreatePlaylistDto } from '../../user/dto/create-playlist.dto';
import { MongoIdValidationPipe } from '../../../common/validation/mongoid-validation.pipe';

@ApiTags('Playlist')
@Controller('playlists')
@UseInterceptors(MongooseClassSerializeInterceptor(Playlist))
export class PlaylistController {
  constructor(private readonly playlistService: PlaylistService) {}

  @ApiOperation({ summary: 'Get playlist list' })
  @ApiBearerAuth('JWT')
  @Get()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getPlaylists(@Requester() requester: JwtPayload) {
    return await this.playlistService.listPlaylists(requester.userId);
  }

  @ApiOperation({ summary: 'Get playlist by id' })
  @ApiBearerAuth('JWT')
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getPlaylistById(
    @Requester() requester: JwtPayload,
    @Param('id', MongoIdValidationPipe) playlistId: string,
  ) {
    return await this.playlistService.getPlaylistById(
      requester.userId,
      playlistId,
    );
  }

  @ApiOperation({
    summary: 'Create playlist',
    description:
      'If playlist name is exist in playlist list of user, can not create',
  })
  @ApiBearerAuth('JWT')
  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @ResponseMessage('Created playlist successfully')
  async createPlaylist(
    @Requester() requester: JwtPayload,
    @Body() dto: CreatePlaylistDto,
  ) {
    dto.userId = requester.userId;
    return await this.playlistService.createPlaylist(dto);
  }

  @ApiOperation({
    summary: 'Update playlist',
    description:
      'If playlist name is exist in playlist list of user, can not update',
  })
  @ApiBearerAuth('JWT')
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @ResponseMessage('Updated playlist successfully')
  async updatePlaylist(
    @Requester() requester: JwtPayload,
    @Param('id', MongoIdValidationPipe) playlistId: string,
    @Body() dto: CreatePlaylistDto,
  ) {
    return await this.playlistService.updatePlaylist(
      playlistId,
      requester.userId,
      dto,
    );
  }

  @ApiOperation({ summary: 'Remove playlist' })
  @ApiBearerAuth('JWT')
  @Delete('/:id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Removed playlist')
  async removePlaylist(
    @Requester() requester: JwtPayload,
    @Param('id', MongoIdValidationPipe) playlistId: string,
  ) {
    return await this.playlistService.removePlaylist(
      requester.userId,
      playlistId,
    );
  }

  @ApiOperation({ summary: 'Add an episode to playlist' })
  @ApiBearerAuth('JWT')
  @Post(':playlistId/episodes/:episodeId')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Added episode to playlist')
  async addEpisodeToPlaylist(
    @Requester() requester: JwtPayload,
    @Param('playlistId', MongoIdValidationPipe) playlistId: string,
    @Param('episodeId', MongoIdValidationPipe) episodeId: string,
  ) {
    return await this.playlistService.addEpisodeToPlaylist(
      episodeId,
      playlistId,
      requester.userId,
    );
  }

  @ApiOperation({ summary: 'Remove all episode to playlist' })
  @ApiBearerAuth('JWT')
  @Delete(':playlistId/episodes')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Removed all episode from playlist')
  async removeAllEpisodeFromPlaylist(
    @Requester() requester: JwtPayload,
    @Param('playlistId', MongoIdValidationPipe) playlistId: string,
  ) {
    return await this.playlistService.removeAllEpisodeFromPlaylist(
      requester.userId,
      playlistId,
    );
  }

  @ApiOperation({ summary: 'Remove an episode to playlist' })
  @ApiBearerAuth('JWT')
  @Delete(':playlistId/episodes/:episodeId')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Removed episode from playlist')
  async removeEpisodeFromPlaylist(
    @Requester() requester: JwtPayload,
    @Param('playlistId', MongoIdValidationPipe) playlistId: string,
    @Param('episodeId', MongoIdValidationPipe) episodeId: string,
  ) {
    return await this.playlistService.removeEpisodeFromPlaylist(
      episodeId,
      playlistId,
      requester.userId,
    );
  }
}
