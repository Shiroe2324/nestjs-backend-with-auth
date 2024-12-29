import { Module } from '@nestjs/common';

import { CloudinaryProvider } from '@/modules/shared/cloudinary/cloudinary.provider';
import { CloudinaryService } from '@/modules/shared/cloudinary/cloudinary.service';

@Module({
  providers: [CloudinaryProvider, CloudinaryService],
  exports: [CloudinaryProvider, CloudinaryService],
})
export class CloudinaryModule {}
