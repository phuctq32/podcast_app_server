import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { BadRequestException } from '@nestjs/common';

function multerOptions(fileSize: number, acceptedFileMimetypes: string[]) {
  const mimetypeMatchRegex = new RegExp(
    `\/(${acceptedFileMimetypes.join('|')})$`,
  );
  return {
    // Limit the file size
    limits: {
      fileSize: fileSize, // 30MB
    },
    fileFilter(
      eq: any,
      file: {
        fieldname: string;
        originalname: string;
        encoding: string;
        mimetype: string;
        size: number;
        destination: string;
        filename: string;
        path: string;
        buffer: Buffer;
      },
      callback: (error: Error, acceptFile: boolean) => void,
    ) {
      // Check file type, just accept media file .mp3, .aac
      console.log(file);
      if (!file.mimetype.match(mimetypeMatchRegex)) {
        callback(
          new BadRequestException(
            `Unsupported file type .${file.originalname.split('.').pop()}`,
          ),
          false,
        );
      }

      callback(null, true);
    },
  } as MulterOptions;
}

const acceptedAudioFileMimetypes = ['mp3', 'aac', 'x-aac', 'mpeg'];
export const multerOptionsForAudioFile = multerOptions(
  30 * 1024 * 1024,
  acceptedAudioFileMimetypes,
);

const acceptedImageFileMimetypes = ['jpg', 'jpeg', 'png'];
export const multerOptionsForImageFile = multerOptions(
  10 * 1024 * 1024,
  acceptedImageFileMimetypes,
);
