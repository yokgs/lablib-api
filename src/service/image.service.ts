import { DeleteResult, Repository } from 'typeorm';
import { PostgresDataSource } from '../config/datasource.config';
import { Injectable } from '@nestjs/common';
import { ImageEntity } from '../model/image';

@Injectable()
export class ImageService {

    private imageRepository: Repository<ImageEntity>;

    constructor() {
        this.imageRepository = PostgresDataSource.getRepository(ImageEntity);
    }

    public async getById(id: string): Promise<ImageEntity | null> {
        return this.imageRepository.findOne({ where: { id } });
    }

    public async create(image: ImageEntity): Promise<ImageEntity> {
        return this.imageRepository.save(image);
    }
    public async delete(id: string): Promise<DeleteResult> {
        return this.imageRepository.delete({ id });
    }

    public async setDefaultImage(image: ImageEntity): Promise<ImageEntity> {
        let img = await this.imageRepository.findOne({ where: { isDefault: true } });
        await this.delete(img.id);
        image.isDefault = true;
        return this.imageRepository.save(image);
    }
    public async getDefaultImage(): Promise<String> {
        let img = await this.imageRepository.findOne({ where: { isDefault: true } });
        return img.id;
    }

}

export default new ImageService();
