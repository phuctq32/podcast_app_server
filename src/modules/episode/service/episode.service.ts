import { InjectModel } from '@nestjs/mongoose';
import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Episode } from '../../../entities/episode.entity';
import { Model } from 'mongoose';
import { CreateEpisodeDto } from '../dto/create-episode.dto';
import { Podcast } from '../../../entities/podcast.entity';

@Injectable()
export class EpisodeService {
  private readonly logger: Logger = new Logger(EpisodeService.name);
  constructor(
    @InjectModel(Episode.name) private readonly episodeModel: Model<Episode>,
    @InjectModel(Podcast.name) private readonly podcastModel: Model<Podcast>,
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
}
