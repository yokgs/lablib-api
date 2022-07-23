import { DeleteResult, Repository } from 'typeorm';
import { PostgresDataSource } from '../config/datasource.config';
import { Lab } from '../model/lab';
import { Injectable } from '@nestjs/common';

@Injectable()
export class LabService {

    private labRepository: Repository<Lab>;

    constructor() {
        this.labRepository = PostgresDataSource.getRepository(Lab);
    }

    public async update(labId: number, lab: Lab) {
        return this.labRepository.save({ ...lab, id: labId });
    }
    public async getAll(): Promise<Lab[]> {
        return this.labRepository.find({
            relations:['chapter', 'steps']
        });
    }

    public async getById(id: number): Promise<Lab | null> {
        return this.labRepository.findOne({ where: { id }, relations: ['chapter', 'steps'] });
    }

    public async create(lab: Lab): Promise<Lab> {
        return this.labRepository.save(lab);
    }
    public async delete(id: number): Promise<DeleteResult> {
        return this.labRepository.delete({ id });
    }
    public async getByName(name: string): Promise<Lab | null> {
        return this.labRepository.findOne({ where: { name }, relations: ['chapter', 'steps'] });
    }
    public async getByChapter(chapterId: number): Promise<Lab[]> {
        return  (await this.getAll()).filter(x => x.chapter.id === chapterId);
    }
}

export default new LabService();
