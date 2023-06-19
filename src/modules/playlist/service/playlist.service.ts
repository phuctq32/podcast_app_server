import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Playlist, PlaylistDocument } from '../../../entities/playlist.entity';
import { Model } from 'mongoose';
import { User } from '../../../entities/user.entity';
import { Episode } from '../../../entities/episode.entity';
import { CreatePlaylistDto } from '../../user/dto/create-playlist.dto';

@Injectable()
export class PlaylistService {
  private readonly logger = new Logger(PlaylistService.name);
  constructor(
    @InjectModel(Playlist.name) private readonly playlistModel: Model<Playlist>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Episode.name) private readonly episodeModel: Model<Episode>,
  ) {}

  async createPlaylist(dto: CreatePlaylistDto) {
    this.logger.log(`In func ${this.createPlaylist.name}`);

    const user = await this.userModel.findOne({ _id: dto.userId });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const existingPlaylist = await this.playlistModel.findOne({
      name: dto.name,
      user: user._id,
    });

    if (existingPlaylist) {
      throw new BadRequestException('Playlist name already exists');
    }

    const newPlaylist = await this.playlistModel.create({
      name: dto.name,
      user: user._id,
    });

    return newPlaylist;
  }

  async updatePlaylist(dto: CreatePlaylistDto) {
    this.logger.log(`In func ${this.updatePlaylist.name}`);

    const user = await this.userModel.findOne({ _id: dto.userId });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const existingPlaylist = await this.playlistModel.findOne({
      name: dto.name,
      user: user._id,
    });
    if (existingPlaylist) {
      throw new BadRequestException('Playlist name already exists');
    }

    return existingPlaylist;
  }

  async listPlaylists(userId: string) {
    this.logger.log(`In func ${this.listPlaylists.name}`);

    const user = await this.userModel.findOne({ _id: userId });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const playlists: PlaylistDocument[] = await this.playlistModel
      .find({
        user: user._id,
      })
      .select('-episodes');

    return playlists;
  }

  async getPlaylistById(userId: string, playlistId: string) {
    this.logger.log(`In func ${this.getPlaylistById.name}`);

    const user = await this.userModel.findOne({ _id: userId });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const playlist = await this.playlistModel.findOne({ _id: playlistId });
    if (!playlist) {
      throw new NotFoundException('Playlist not found');
    }

    if (playlist.user.toString() !== user._id.toString()) {
      throw new BadRequestException('User is not playlist author');
    }

    await playlist.populate('episodes');

    return playlist;
  }

  async addEpisodeToPlaylist(
    episodeId: string,
    playlistId: string,
    userId: string,
  ) {
    this.logger.log(`In func ${this.addEpisodeToPlaylist.name}`);

    const user = await this.userModel.findOne({ _id: userId });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const playlist = await this.playlistModel.findOne({ _id: playlistId });
    if (playlist.user.toString() !== user._id.toString()) {
      throw new BadRequestException('User is not playlist author');
    }

    const episode = await this.episodeModel.findOne({ _id: episodeId });
    if (!episode) {
      throw new NotFoundException('Episode not found');
    }

    if (playlist.episodes.includes(episode._id)) {
      throw new BadRequestException('Episode already exists in playlist');
    }

    playlist.episodes.push(episode._id);
    await playlist.save();
    await playlist.populate('episodes');

    return playlist;
  }

  async removeAllEpisodeFromPlaylist(userId: string, playlistId: string) {
    this.logger.log(`In func ${this.removeAllEpisodeFromPlaylist.name}`);

    const user = await this.userModel.findOne({ _id: userId });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const playlist = await this.playlistModel.findOne({ _id: playlistId });
    if (!playlist) {
      throw new NotFoundException('Playlist not found');
    }

    if (playlist.user.toString() !== user._id.toString()) {
      throw new BadRequestException('User is not playlist author');
    }

    playlist.episodes = [];
    await playlist.save();

    return [];
  }

  async removeEpisodeFromPlaylist(
    episodeId: string,
    playlistId: string,
    userId: string,
  ) {
    this.logger.log(`In func ${this.removeEpisodeFromPlaylist.name}`);

    const user = await this.userModel.findOne({ _id: userId });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const playlist = await this.playlistModel.findOne({ _id: playlistId });
    if (playlist.user.toString() !== user._id.toString()) {
      throw new BadRequestException('User is not playlist author');
    }

    const episode = await this.episodeModel.findOne({ _id: episodeId });
    if (!episode) {
      throw new NotFoundException('Episode not found');
    }

    if (!playlist.episodes.includes(episode._id)) {
      throw new BadRequestException('Episode not exists in playlist');
    }

    playlist.episodes = playlist.episodes.filter(
      (ep) => ep.toString() !== episode._id.toString(),
    );
    await playlist.save();
    await playlist.populate('episodes');

    return playlist;
  }

  async removePlaylist(userId: string, playlistId: string) {
    this.logger.log(`In func ${this.removePlaylist.name}`);

    const user = await this.userModel.findOne({ _id: userId });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const playlist = await this.playlistModel.findOne({ _id: playlistId });
    if (!playlist) {
      throw new NotFoundException('Playlist not found');
    }

    if (playlist.user.toString() !== user._id.toString()) {
      throw new BadRequestException('User is not playlist author');
    }

    await this.playlistModel.deleteOne({ _id: playlist._id });

    return null;
  }
}
