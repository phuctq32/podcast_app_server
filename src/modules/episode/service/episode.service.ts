import { InjectModel } from '@nestjs/mongoose';
import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Episode, EpisodeDocument } from '../../../entities/episode.entity';
import { Model } from 'mongoose';
import { CreateEpisodeDto } from '../dto/create-episode.dto';
import { Podcast } from '../../../entities/podcast.entity';
import { UpdateEpisodeDto } from '../dto/update-episode.dto';
import { User } from '../../../entities/user.entity';

@Injectable()
export class EpisodeService {
  private readonly logger: Logger = new Logger(EpisodeService.name);
  constructor(
    @InjectModel(Episode.name) private readonly episodeModel: Model<Episode>,
    @InjectModel(Podcast.name) private readonly podcastModel: Model<Podcast>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async getEpisodeById(episodeId: string, userId: string) {
    this.logger.log(`In func ${this.getEpisodeById.name}`);

    const episode = await this.episodeModel.findOne({ _id: episodeId });
    if (!episode) {
      throw new NotFoundException('Episode not found');
    }

    await episode.checkListened(userId);
    await episode.populate('podcast');
    await episode.populate('podcast.author podcast.category');

    return { episode };
  }

  async createEpisode(dto: CreateEpisodeDto) {
    this.logger.log(`In func ${this.createEpisode.name}`);

    const podcast = await this.podcastModel.findById(dto.podcast_id);
    if (!podcast) {
      throw new NotFoundException('Podcast not found');
    }

    if (dto.user_id !== podcast.author.toString()) {
      throw new BadRequestException('User is not podcast author');
    }

    if (!dto.image) {
      dto.image = podcast.image;
    }

    const newEpisode = await this.episodeModel.create({
      ...dto,
      user_id: undefined,
      podcast: podcast._id,
    });

    await newEpisode.populate('podcast');
    await newEpisode.populate('podcast.category');
    await newEpisode.populate('podcast.author');

    return { newEpisode };
  }

  async updateEpisode(
    episodeId: string,
    userId: string,
    dto: UpdateEpisodeDto,
  ) {
    this.logger.log(`In func ${this.updateEpisode.name}`);

    const episode = await this.episodeModel.findOne({ _id: episodeId });
    if (!episode) {
      throw new NotFoundException('Episode not found');
    }

    const user = await this.userModel.findOne({ _id: userId });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await episode.populate('podcast');
    if (user._id.toString() !== episode.podcast.author.toString()) {
      throw new BadRequestException('User is not episode author');
    }

    if (dto.podcast_id && dto.podcast_id !== episode.podcast._id.toString()) {
      throw new BadRequestException('User is not changing podcast author');
    }
    delete dto.description;
    console.log(dto);
    Object.keys(dto).forEach((key) => {
      episode[key] = dto[key];
    });

    await episode.save();
    return { episode };
  }

  // listen
  async listen(episodeId: string, userId: string) {
    const episode = await this.episodeModel.findOne({ _id: episodeId });
    if (!episode) {
      throw new NotFoundException('Episode not found');
    }

    const user = await this.userModel.findOne({ _id: userId });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    episode.num_listening++;
    await episode.save();
    await episode.checkListened(userId);

    return { episode };
  }

  // Favorite
  async getFavorite(userId: string) {
    const user = await this.userModel
      .findOne({ _id: userId })
      .populate('favorite_episodes');
    if (!user) {
      throw new NotFoundException('User not found');
    }

    for (const ep of user.favorite_episodes) {
      await (ep as EpisodeDocument).checkListened(userId);
    }

    return { favorite_episodes: user.favorite_episodes };
  }

  async addToFavorite(episodeId: string, userId: string) {
    const user = await this.userModel.findOne({ _id: userId });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const episode = await this.episodeModel.findOne({ _id: episodeId });
    if (!episode) {
      throw new NotFoundException('Episode not found');
    }

    if (user.favorite_episodes.includes(episode._id)) {
      throw new BadRequestException('Episode already exist in favorite list');
    }

    user.favorite_episodes.push(episode._id);
    await user.save();
    await user.populate('favorite_episodes');

    for (const ep of user.favorite_episodes) {
      await (ep as EpisodeDocument).checkListened(userId);
    }

    return { favorite_episodes: user.favorite_episodes };
  }

  async removeFromFavorite(episodeId: string, userId: string) {
    const user = await this.userModel.findOne({ _id: userId });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const episode = await this.episodeModel.findOne({ _id: episodeId });
    if (!episode) {
      throw new NotFoundException('Episode not found');
    }

    if (!user.favorite_episodes.includes(episode._id)) {
      throw new BadRequestException('Episode not exist in favorite list');
    }

    user.favorite_episodes = user.favorite_episodes.filter(
      (ep) => ep.toString() !== episode._id.toString(),
    );
    await user.save();
    await user.populate('favorite_episodes');

    for (const ep of user.favorite_episodes) {
      await (ep as EpisodeDocument).checkListened(userId);
    }

    return { favorite_episodes: user.favorite_episodes };
  }
}
