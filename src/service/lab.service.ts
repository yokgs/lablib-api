import { DeleteResult, Repository } from 'typeorm';
import { PostgresDataSource } from '../config/datasource.config';
import { Lab } from '../model/lab';

class LabService {

    private labRepository: Repository<Lab>;

    constructor() {
        this.labRepository = PostgresDataSource.getRepository(Lab);
    }

    public async update(labId: number, lab: Lab) {
        return this.labRepository.save({ ...lab, id: labId });
    }
    public async getAll(): Promise<Lab[]> {
        return this.labRepository.find();
    }

    public async getById(id: number): Promise<Lab | null> {
        return this.labRepository.findOne({ where: { id } });
    }

    public async create(lab: Lab): Promise<Lab> {
        return this.labRepository.save(lab);
    }
    public async delete(id: number): Promise<DeleteResult> {
        return this.labRepository.delete({ id });
    }
    public async getByName(name: string): Promise<Lab | null> {
        return this.labRepository.findOneBy({ name });
    }
}

export default new LabService();
