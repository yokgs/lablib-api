import { DeleteResult, Repository } from 'typeorm';
import { PostgresDataSource } from '../config/datasource.config';
import { Chapter } from '../model/chapter';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ChapterService {

    private chapterRepository: Repository<Chapter>;

    constructor() {
        this.chapterRepository = PostgresDataSource.getRepository(Chapter);
    }

    public async update(chapterId: number, chapter: Chapter) {
        return this.chapterRepository.save({ ...chapter, id: chapterId });
    }
    
    public async getAll(): Promise<Chapter[]> {
        return this.chapterRepository.find({
            relations: ['course', 'labs', 'course.category']
        });
    }

    public async getById(id: number): Promise<Chapter | null> {
        return this.chapterRepository.findOne({ where: { id }, relations: ['course', 'labs', 'course.category'] });
    }

    public async create(chapter: Chapter): Promise<Chapter> {
        return this.chapterRepository.save(chapter);
    }

    public async delete(id: number): Promise<DeleteResult> {
        return this.chapterRepository.delete({ id });
    }

    public async getByName(name: string): Promise<Chapter | null> {
        return this.chapterRepository.findOneBy({ name });
    }

    public async getByCourse(courseId: number): Promise<Chapter[]> {
        return (await this.getAll()).filter(x => x.course.id === courseId);
    }

}
export default new ChapterService();