import { DeleteResult, Repository } from 'typeorm';
import { PostgresDataSource } from '../config/datasource.config';
import { Chapter } from '../model/chapter';

class ChapterService {

    private chapterRepository: Repository<Chapter>;

    constructor() {
        this.chapterRepository = PostgresDataSource.getRepository(Chapter);
    }

    public async update(chapterId: number, chapter: Chapter) {
        return this.chapterRepository.save({ ...chapter, id: chapterId });
    }
    public async getAll(): Promise<Chapter[]> {
        return this.chapterRepository.find();
    }

    public async getById(id: number): Promise<Chapter | null> {
        return this.chapterRepository.findOne({ where: { id } });
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
}

export default new ChapterService();
