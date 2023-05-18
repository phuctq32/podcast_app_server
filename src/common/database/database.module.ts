import { DynamicModule, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Schema } from 'mongoose';

interface MongooseModelConfig {
  name: string;
  schema: Schema;
  callback?: (schema: Schema) => void;
}

@Module({
  imports: [
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
  ],
  //exports: [MongooseModule],
})
export class DatabaseModule {
  static forFeature(modelConfigs: MongooseModelConfig[]): DynamicModule {
    const factories = modelConfigs.map((config) => ({
      name: config.name,
      useFactory: () => {
        if (config.callback) {
          config.callback(config.schema);
        }
        return config.schema;
      },
    }));
    return MongooseModule.forFeatureAsync(factories);
  }
}
