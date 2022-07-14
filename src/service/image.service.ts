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
}

export default new ImageService();
