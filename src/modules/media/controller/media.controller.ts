import {
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  multerOptionsForAudioFile,
  multerOptionsForImageFile,
} from '../../../configs/multer.config';
import { Express } from 'express';
import { ResponseMessage } from '../../../common/decorators/message-response.decorator';
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { MediaService } from '../service/media.service';

@ApiTags('Media')
@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
      required: ['file'],
    },
  })
  @Post('audio/upload')
  @UseInterceptors(FileInterceptor('file', multerOptionsForAudioFile))
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Uploaded file successfully')
  async uploadAudioFile(@UploadedFile() file: Express.Multer.File) {
    return await this.mediaService.uploadAudio(file);
  }

  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
      required: ['file'],
    },
  })
  @Post('image/upload')
  @UseInterceptors(FileInterceptor('file', multerOptionsForImageFile))
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Uploaded file successfully')
  async uploadImageFile(@UploadedFile() file: Express.Multer.File) {
    return await this.mediaService.uploadImage(file);
  }
}
