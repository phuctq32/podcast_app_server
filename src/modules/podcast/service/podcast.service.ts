import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Podcast } from '../../../entities/podcast.entity';
import { Model } from 'mongoose';
import { User } from '../../../entities/user.entity';
import { CreatePodcastDto } from '../dto/create-podcast.dto';
import { Episode, EpisodeDocument } from '../../../entities/episode.entity';
import { Category } from '../../../entities/category.entity';
import { UpdatePodcastDto } from '../dto/update-podcast.dto';
import { PaginationDto } from '../../../common/pagination/pagination.dto';
import { RemoveAccentsService } from '../../../common/remove-accents.service';
import { PaginationService } from '../../../common/pagination/pagination.service';

@Injectable()
export class PodcastService {
  private readonly logger: Logger = new Logger(PodcastService.name);
  constructor(
    @InjectModel(Podcast.name) private readonly podcastModel: Model<Podcast>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Episode.name) private readonly episodeModel: Model<Episode>,
    @InjectModel(Category.name) private readonly categoryModel: Model<Category>,
    private readonly removeAccentsService: RemoveAccentsService,
    private readonly paginationService: PaginationService,
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

    return newPodcast;
  }

  async updatePodcast(
    podcastId: string,
    userId: string,
    dto: UpdatePodcastDto,
  ) {
    const podcast = await this.podcastModel.findOne({ _id: podcastId });
    if (!podcast) {
      throw new NotFoundException('Podcast not found');
    }

    const user = await this.userModel.findOne({ _id: userId });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (podcast.author.toString() !== user._id.toString()) {
      throw new BadRequestException('User is not author');
    }

    if (dto.category_id) {
      const category = await this.categoryModel.findOne({
        _id: dto.category_id,
      });
      if (!category) {
        throw new NotFoundException('Category not found');
      }
      podcast.category = category._id;
      delete dto.category_id;
    }

    Object.keys(dto).forEach((key) => {
      podcast[key] = dto[key];
    });

    await podcast.save();
    await podcast.populate('author'); // Get author info;
    await podcast.populate('category'); // Get category info
    await podcast.populate('episodes'); // Get episodes of podcast
    await podcast.calcViews();

    return podcast;
  }

  async getPodcastById(podcastId: string, userId: string) {
    const podcast = await this.podcastModel.findOne({ _id: podcastId });
    if (!podcast) {
      throw new NotFoundException('Podcast not found');
    }
    await podcast.populate('author'); // Get author info;
    await podcast.populate('category'); // Get category info
    await podcast.populate('episodes'); // Get episodes of podcast
    await podcast.calcViews();
    await podcast.checkSubscription(userId);

    // Check requester watched
    for (let i = 0; i < podcast.episodes.length; i++) {
      await (podcast.episodes[i] as EpisodeDocument).checkListened(userId);
      (podcast.episodes[i] as EpisodeDocument).podcast = undefined;
    }

    return podcast;
  }

  async searchPodcasts(
    searchTerm: string,
    paginationDto: PaginationDto,
    userId: string,
  ) {
    const user = await this.userModel.findOne({ _id: userId });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const currentSearchHistory = user.search_history;
    let updatedSearchHistory = currentSearchHistory;
    if (currentSearchHistory.includes(searchTerm)) {
      updatedSearchHistory = currentSearchHistory.filter(
        (s) => s !== searchTerm,
      );
      updatedSearchHistory.push(searchTerm);
    } else {
      updatedSearchHistory.push(searchTerm);
    }
    user.search_history = updatedSearchHistory;
    await user.save();

    const searchStr =
      this.removeAccentsService.removeVietnameseAccents(searchTerm);
    if (!paginationDto) {
      const podcasts = await this.podcastModel
        .find(
          {
            $text: {
              $search: searchStr,
              $caseSensitive: false,
            },
          },
          { score: { $meta: 'textScore' } },
        )
        .sort({ score: { $meta: 'textScore' } })
        .populate('author category');
      for (let i = 0; i < podcasts.length; i++) {
        await podcasts[i].calcViews();
        await podcasts[i].checkSubscription(userId);
      }
      return podcasts;
    }

    const podcasts = await this.podcastModel
      .find(
        {
          $text: {
            $search:
              this.removeAccentsService.removeVietnameseAccents(searchTerm),
            $caseSensitive: false,
          },
        },
        { score: { $meta: 'textScore' } },
      )
      .sort({ score: { $meta: 'textScore' } })
      .skip((paginationDto.offset - 1) * paginationDto.limit)
      .limit(paginationDto.limit)
      .populate('author category');

    const podcastsTotalCount = await this.podcastModel.countDocuments({
      $text: {
        $search: this.removeAccentsService.removeVietnameseAccents(searchTerm),
        $caseSensitive: false,
        $diacriticSensitive: false,
      },
    });
    for (let i = 0; i < podcasts.length; i++) {
      await podcasts[i].calcViews();
      await podcasts[i].checkSubscription(userId);
    }

    return {
      data: podcasts,
      pagination: this.paginationService.getInformation(
        paginationDto,
        podcastsTotalCount,
      ),
    };
  }
}
