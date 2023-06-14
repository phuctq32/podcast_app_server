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
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import MongooseClassSerializeInterceptor from '../../../common/interceptor/mongoose-class-serialize.interceptor';
import { Playlist } from '../../../entities/playlist.entity';
import { ResponseMessage } from '../../../common/decorators/message-response.decorator';
import { Requester } from '../../../common/decorators/requester.decorator';
import { JwtPayload } from '../../../utils/jwt/jwt-payload.interface';
import { CreatePlaylistDto } from '../../user/dto/create-playlist.dto';
import { AddEpisodeDto } from '../dto/add-episode.dto';
import { MongoIdValidationPipe } from '../../../common/validation/mongoid-validation.pipe';

@ApiTags('Playlist')
@Controller('playlists')
@UseInterceptors(MongooseClassSerializeInterceptor(Playlist))
export class PlaylistController {
  constructor(private readonly playlistService: PlaylistService) {}

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

  @ApiBearerAuth('JWT')
  @Get()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getPlaylists(@Requester() requester: JwtPayload) {
    return await this.playlistService.listPlaylists(requester.userId);
  }

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

  @ApiBearerAuth('JWT')
  @Patch('/playlists/:id/add-episode')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Added episode to playlist')
  async addEpisodeToPlaylist(
    @Requester() requester: JwtPayload,
    @Param('id', MongoIdValidationPipe) playlistId: string,
    @Body() dto: AddEpisodeDto,
  ) {
    dto.user_id = requester.userId;
    dto.playlist_id = playlistId;
    return await this.playlistService.addEpisodeToPlaylist(dto);
  }

  @ApiBearerAuth('JWT')
  @Patch('/playlists/:id/remove-episode')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Removed episode from playlist')
  async removeEpisodeFromPlaylist(
    @Requester() requester: JwtPayload,
    @Param('id', MongoIdValidationPipe) playlistId: string,
    @Body() dto: AddEpisodeDto,
  ) {
    dto.user_id = requester.userId;
    dto.playlist_id = playlistId;
    return await this.playlistService.removeEpisodeFromPlaylist(dto);
  }

  @ApiBearerAuth('JWT')
  @Delete('/playlists/:id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Removed episode from playlist')
  async removePlaylist(
    @Requester() requester: JwtPayload,
    @Param('id', MongoIdValidationPipe) playlistId: string,
  ) {
    return await this.playlistService.removePlaylist(
      requester.userId,
      playlistId,
    );
  }
}
