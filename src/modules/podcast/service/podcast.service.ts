import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Podcast } from '../../../entities/podcast.entity';
import { Model } from 'mongoose';
import { User } from '../../../entities/user.entity';
import { CreatePodcastDto } from '../dto/create-podcast.dto';
import { Episode } from '../../../entities/episode.entity';
import { Category } from '../../../entities/category.entity';

@Injectable()
export class PodcastService {
  private readonly logger: Logger = new Logger(PodcastService.name);
  constructor(
    @InjectModel(Podcast.name) private readonly podcastModel: Model<Podcast>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Episode.name) private readonly episodeModel: Model<Episode>,
    @InjectModel(Category.name) private readonly categoryModel: Model<Category>,
  ) {}

  async createPodcast(dto: CreatePodcastDto) {
    this.logger.log(`In func ${this.createPodcast.name}`);

    const user = await this.userModel.findById(dto.author_id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const category = await this.categoryModel.findById(dto.category_id);
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const newPodcast = await this.podcastModel.create({
      ...dto,
      category: category._id,
      author: user._id,
    });

    await newPodcast.populate('author category');

    return { newPodcast };
  }

  async getPodcastById(id: string) {
    const podcast = await this.podcastModel
      .findOne({ _id: id })
      .populate('author')
      .populate('episodes');
    if (!podcast) {
      throw new NotFoundException('Podcast not found');
    }

    for (let i = 0; i < podcast.episodes.length; i++) {
      await podcast.episodes[i].checkWatched('646c6dcb27ef40dd725cb935');
      Object.keys(podcast.episodes[i].toObject()).forEach((key) =>
        console.log(key),
      );
    }

    return { podcast };
  }
}
