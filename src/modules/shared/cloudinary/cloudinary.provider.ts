import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';

import { CLOUDINARY } from '@/utils/constants';

export const CloudinaryProvider = {
  provide: CLOUDINARY,
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => {
    return cloudinary.config({
      cloud_name: configService.getOrThrow('cloudinary.cloudName'),
      api_key: configService.getOrThrow('cloudinary.apiKey'),
      api_secret: configService.getOrThrow('cloudinary.apiSecret'),
    });
  },
};
