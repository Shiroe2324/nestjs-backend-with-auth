import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { I18nService } from 'nestjs-i18n';
import { FindOptionsRelations, Repository } from 'typeorm';

import { Picture } from '@/entities/picture.entity';
import { User } from '@/entities/user.entity';
import { I18nTranslations } from '@/generated/i18n.generated';
import { CloudinaryService } from '@/modules/shared/cloudinary/cloudinary.service';
import { FindAllUsersOptions } from '@/types/users';

@Injectable()
export class UsersService {
  private readonly userRelations: FindOptionsRelations<User> = { roles: true, picture: true };

  constructor(
    @InjectRepository(Picture)
    private readonly pictureRepository: Repository<Picture>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly cloudinaryService: CloudinaryService,
    private readonly i18n: I18nService<I18nTranslations>,
  ) {}

  public async findAll(options: FindAllUsersOptions) {
    const { page, limit, order, orderBy } = options;

    const skip = (page - 1) * limit;
    const take = limit;
    const relations = this.userRelations;

    const [users, total] = await this.userRepository.findAndCount({
      skip,
      take,
      order: { [orderBy]: order },
      relations,
    });

    return { total, page, limit, users };
  }

  public async findOne(identifier: number | string) {
    const isIdentifierNumeric = typeof identifier === 'number' || !isNaN(Number(identifier));
    const where = isIdentifierNumeric ? { id: parseInt(identifier.toString(), 10) } : { username: identifier };
    const relations = this.userRelations;

    const user = await this.userRepository.findOne({ where, relations });

    if (!user) {
      throw new NotFoundException(this.i18n.t('users.findOne.notFound'));
    }

    return user;
  }

  public async delete(identifier: number | string) {
    const user = await this.findOne(identifier);

    await this.deletePictureIfExists(user);
    await this.userRepository.remove(user);

    return { user, message: this.i18n.t('users.delete.success') };
  }

  public async updatePicture(identifier: number | string, picture: Express.Multer.File) {
    const user = await this.findOne(identifier);

    const result = await this.cloudinaryService.uploadFile(picture, 'pictures');
    user.picture = this.pictureRepository.create({ url: result.secure_url, publicId: result.public_id });

    await this.deletePictureIfExists(user);
    await this.userRepository.save(user);

    return { user, message: this.i18n.t('users.updatePicture.success') };
  }

  public async deletePicture(identifier: number | string) {
    const user = await this.findOne(identifier);

    if (!user.picture) {
      throw new NotFoundException(this.i18n.t('users.deletePicture.notFound'));
    }

    user.picture = null;

    await this.deletePictureIfExists(user);

    return { user, message: this.i18n.t('users.deletePicture.success') };
  }

  public async update(identifier: number | string, data: Partial<User>) {
    const user = await this.findOne(identifier);
    const fieldsToUpdate = Object.keys(data) as Array<keyof User>;

    if (!fieldsToUpdate.length) {
      throw new BadRequestException(this.i18n.t('users.update.noData'));
    }

    if (data.username && data.username !== user.username) {
      const isUsernameTaken = await this.userRepository.existsBy({ username: data.username });
      if (isUsernameTaken) throw new ConflictException(this.i18n.t('users.update.usernameInUse'));
      user.username = data.username;
    }

    if (data.displayName && data.displayName !== user.displayName) {
      user.displayName = data.displayName;
    }

    if (fieldsToUpdate.every((field) => data[field] === user[field])) {
      throw new BadRequestException(this.i18n.t('users.update.noChanges'));
    }

    await this.userRepository.save(user);

    return { user, message: this.i18n.t('users.update.success') };
  }

  private async deletePictureIfExists(user: User) {
    if (user.picture?.publicId) {
      await this.cloudinaryService.deleteFile(user.picture.publicId);
      await this.pictureRepository.remove(user.picture);
    }
  }
}
