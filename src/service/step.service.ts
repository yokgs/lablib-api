import { DeleteResult, Repository } from 'typeorm';
import { PostgresDataSource } from '../config/datasource.config';
import { Step } from '../model/step';
import { Injectable } from '@nestjs/common';

@Injectable()
export class StepService {

    private stepRepository: Repository<Step>;

    constructor() {
        this.stepRepository = PostgresDataSource.getRepository(Step);
    }

    public async update(stepId: number, step: Step) {
        return this.stepRepository.save({ ...step, id: stepId });
    }
    public async getAll(): Promise<Step[]> {
        return this.stepRepository.find({
            relations:['lab']
        });
    }

    public async getById(id: number): Promise<Step | null> {
        return this.stepRepository.findOne({ where: { id }, relations: ['lab'] });
    }

    public async create(step: Step): Promise<Step> {
        return this.stepRepository.save(step);
    }
    public async delete(id: number): Promise<DeleteResult> {
        return this.stepRepository.delete({ id });
    }
    public async getByName(name: string): Promise<Step | null> {
        return this.stepRepository.findOne({ where: { name }, relations: ['lab'] });
    }
    public async getByLab(labId: number): Promise<Step[]> {
        return  (await this.getAll()).filter(x => x.lab.id === labId);
    }
}

export default new StepService();
