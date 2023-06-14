import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import databaseConfig from './configs/database.config';
import { AuthModule } from './modules/auth/auth.module';
import sendgridConfig from './configs/sendgrid.config';
import googleOauthConfig from './configs/google-oauth.config';
import { UserModule } from './modules/user/user.module';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { HttpExceptionFilter } from './common/exception/http-exception.filter';
import { LoggingInterceptor } from './common/interceptor/logging.interceptor';
import { ResponseFormatInterceptor } from './common/interceptor/response-format.interceptor';
import { CustomValidationPipe } from './common/validation/custom-validation.pipe';
import { PodcastModule } from './modules/podcast/podcast.module';
import { EpisodeModule } from './modules/episode/episode.module';
import { MongooseModule } from '@nestjs/mongoose';
import { CategoryModule } from './modules/category/category.module';
import { MediaModule } from './modules/media/media.module';
import cloudinaryConfig from './configs/cloudinary.config';
import { PlaylistModule } from './modules/playlist/playlist.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [
        databaseConfig,
        sendgridConfig,
        googleOauthConfig,
        cloudinaryConfig,
      ],
      expandVariables: true,
      cache: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('database.uri'),
        dbName: configService.get<string>('database.name'),
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UserModule,
    PodcastModule,
    EpisodeModule,
    CategoryModule,
    MediaModule,
    PlaylistModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_PIPE,
      useClass: CustomValidationPipe,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseFormatInterceptor,
    },
  ],
})
export class AppModule {}
