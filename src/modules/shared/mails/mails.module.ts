import { Module } from '@nestjs/common';

import { MailsService } from '@/modules/shared/mails/mails.service';

@Module({
  providers: [MailsService],
  exports: [MailsService],
})
export class MailsModule {}
