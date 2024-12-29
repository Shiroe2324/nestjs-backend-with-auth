import { FileTypeValidator, MaxFileSizeValidator, ParseFilePipe } from '@nestjs/common';

export class ParseImageFilePipe extends ParseFilePipe {
  constructor() {
    super({
      validators: [new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 4 }), new FileTypeValidator({ fileType: '.(jpg|jpeg|png)' })],
    });
  }
}
