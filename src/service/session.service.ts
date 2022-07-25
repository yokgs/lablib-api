import { DeleteResult, Repository } from 'typeorm';
import { PostgresDataSource } from '../config/datasource.config';
import { Injectable } from '@nestjs/common';
import { SessionContainer } from '../model/session';
import { Session, Store } from 'express-session';
import { TypeormStore } from 'typeorm-store';

@Injectable()
export class SessionService {

    private sessionRepository: Repository<SessionContainer>;

    
    constructor() {
        this.sessionRepository = PostgresDataSource.getRepository(SessionContainer);
    }

    public sessionHandler() : Store{
        return new TypeormStore({ repository: this.sessionRepository})
    }

    public async update(sessionId: string, session: SessionContainer) {
        return this.sessionRepository.save({ ...session, id: sessionId });
    }
    
    public async getAll(): Promise<SessionContainer[]> {
        return this.sessionRepository.find({
            relations: ['course', 'labs', 'course.category']
        });
    }

    public async getById(id: string): Promise<SessionContainer | null> {
        return this.sessionRepository.findOne({ where: { id } });
    }

    public async create(session: SessionContainer): Promise<SessionContainer> {
        return this.sessionRepository.save(session);
    }

    public async delete(id: string): Promise<DeleteResult> {
        return this.sessionRepository.delete({ id });
    }

}
export default new SessionService();