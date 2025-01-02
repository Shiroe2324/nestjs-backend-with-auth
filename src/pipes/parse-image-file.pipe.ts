import { FileTypeValidator, MaxFileSizeValidator, ParseFilePipe } from '@nestjs/common';

import limitsConfig from '@/config/limits.config';

const { maxImageFileSize } = limitsConfig();

export class ParseImageFilePipe extends ParseFilePipe {
  constructor(maxSize: number = maxImageFileSize) {
    super({
      validators: [new MaxFileSizeValidator({ maxSize: 1024 * 1024 * maxSize }), new FileTypeValidator({ fileType: '.(jpg|jpeg|png|gif|webp)' })],
    });
  }
}
