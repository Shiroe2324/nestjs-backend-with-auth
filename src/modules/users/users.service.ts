import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { I18nService } from 'nestjs-i18n';
import { Repository } from 'typeorm';

import { User } from '@/entities/user.entity';
import { Order, OrderBy } from '@/enums/find-all-users.enum';
import { I18nTranslations } from '@/generated/i18n.generated';
import { CloudinaryService } from '@/modules/shared/cloudinary/cloudinary.service';
import { FindAllUsersOptions } from '@/types/users';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly cloudinaryService: CloudinaryService,
    private readonly i18n: I18nService<I18nTranslations>,
  ) {}

  public async findAll({ page = 1, limit = 10, order = Order.ASC, orderBy = OrderBy.ID }: FindAllUsersOptions) {
    const [users, total] = await this.userRepository.findAndCount({
      relations: ['role'],
      skip: (page - 1) * limit,
      take: limit,
      order: { [orderBy]: order },
    });

    return { total, page, limit, users };
  }

  public async findOne(identifier: number | string) {
    let user: User | null | undefined;

    if (typeof identifier === 'number' || !isNaN(Number(identifier))) {
      user = await this.userRepository.findOne({ where: { id: parseInt(identifier.toString(), 10) }, relations: { roles: true } });
    } else if (typeof identifier === 'string') {
      user = await this.userRepository.findOne({ where: { username: identifier }, relations: { roles: true } });
    }

    if (!user) {
      throw new NotFoundException(this.i18n.t('users.findOne.notFound'));
    }

    return user;
  }

  public async delete(identifier: number | string) {
    const user = await this.findOne(identifier);

    if (user.picturePublicId) {
      await this.cloudinaryService.deleteFile(user.picturePublicId);
    }

    await this.userRepository.remove(user);

    return { user, message: this.i18n.t('users.delete.success') };
  }

  public async update(identifier: number | string, data: Partial<User>) {
    const user = await this.findOne(identifier);
    const initialUser = { ...user };

    if (!data.username && !data.displayName) {
      throw new NotFoundException(this.i18n.t('users.update.noData'));
    }

    if (data.username && data.username !== user.username) {
      if (await this.userRepository.existsBy({ username: data.username })) {
        throw new ConflictException(this.i18n.t('users.update.usernameInUse'));
      }

      user.username = data.username;
    }

    if (data.displayName && data.displayName !== user.displayName) {
      user.displayName = data.displayName;
    }

    if (JSON.stringify(initialUser) === JSON.stringify(user)) {
      throw new BadRequestException(this.i18n.t('users.update.noChanges'));
    }

    await this.userRepository.save(user);

    return { user, message: this.i18n.t('users.update.success') };
  }

  public async updatePicture(identifier: number | string, picture: Express.Multer.File) {
    const user = await this.findOne(identifier);

    if (user.picturePublicId) {
      await this.cloudinaryService.deleteFile(user.picturePublicId);
    }

    const result = await this.cloudinaryService.uploadFile(picture, 'pictures');
    user.picture = result.secure_url;
    user.picturePublicId = result.public_id;
    await this.userRepository.save(user);

    return { user, message: this.i18n.t('users.updatePicture.success') };
  }

  public async deletePicture(identifier: number | string) {
    const user = await this.findOne(identifier);

    if (!user.picture) {
      throw new NotFoundException(this.i18n.t('users.deletePicture.notFound'));
    }

    if (user.picturePublicId) {
      await this.cloudinaryService.deleteFile(user.picturePublicId);
      user.picturePublicId = null;
    }

    user.picture = null;
    await this.userRepository.save(user);

    return { user, message: this.i18n.t('users.deletePicture.success') };
  }
}
