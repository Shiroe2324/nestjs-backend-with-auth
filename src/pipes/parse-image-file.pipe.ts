import { FileTypeValidator, MaxFileSizeValidator, ParseFilePipe } from '@nestjs/common';

import limitsConfig from '@/config/limits.config';

const { maxFileSize } = limitsConfig();

export class ParseImageFilePipe extends ParseFilePipe {
  constructor(maxSize: number = maxFileSize) {
    super({
      validators: [new MaxFileSizeValidator({ maxSize: 1024 * 1024 * maxSize }), new FileTypeValidator({ fileType: '.(jpg|jpeg|png|gif|webp)' })],
    });
  }
}
