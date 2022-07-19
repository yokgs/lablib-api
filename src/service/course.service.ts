import { DeleteResult, Repository } from 'typeorm';
import { PostgresDataSource } from '../config/datasource.config';
import { Course } from '../model/course';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CourseService {

    private courseRepository: Repository<Course>;

    constructor() {
        this.courseRepository = PostgresDataSource.getRepository(Course);
    }

    public async update(courseId: number, course: Course) {
        return this.courseRepository.save({ ...course, id: courseId });
    }
    public async getAll(): Promise<Course[]> {
        return this.courseRepository.find({ relations: ['category', 'chapters'] });
    }

    public async getById(id: number): Promise<Course | null> {
        return this.courseRepository.findOne({ where: { id } });
    }

    public async create(course: Course): Promise<Course> {
        return this.courseRepository.save(course);
    }
    public async delete(id: number): Promise<DeleteResult> {
        return this.courseRepository.delete({ id });
    }
    public async getByName(name: string): Promise<Course | null> {
        return this.courseRepository.findOneBy({ name });
    }
    public async getByCategory(categoryId: number): Promise<Course[]> {
        return this.courseRepository.createQueryBuilder()
            .leftJoin("Course.category", "Category")
            .where("Category.id = :categoryId", { categoryId })
            .getMany();
    }

}

export default new CourseService();