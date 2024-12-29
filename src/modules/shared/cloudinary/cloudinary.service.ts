import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';

import { CloudinaryResponse } from '@/types/cloudinary';

@Injectable()
export class CloudinaryService {
  public async getFile(publicId: string) {
    return new Promise<CloudinaryResponse>((resolve, reject) => {
      cloudinary.api.resource(publicId, (error, result) => {
        if (error) return reject(error);
        resolve(result);
      });
    });
  }

  public uploadFile(file: Express.Multer.File, folder?: string) {
    return new Promise<CloudinaryResponse>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream({ folder }, (error, result) => {
        if (error || !result) return reject(error);
        resolve(result);
      });

      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }

  public async updateFile(publicId: string, file: Express.Multer.File) {
    await this.deleteFile(publicId);
    return this.uploadFile(file);
  }

  public deleteFile(publicId: string) {
    return new Promise<CloudinaryResponse>((resolve, reject) => {
      cloudinary.uploader.destroy(publicId, (error, result) => {
        if (error) return reject(error);
        resolve(result);
      });
    });
  }
}
