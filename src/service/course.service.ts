import { DeleteResult, Repository } from 'typeorm';
import { PostgresDataSource } from '../config/datasource.config';
import { Course } from '../model/course';
import { Injectable } from '@nestjs/common';
import { x } from 'joi';
import { xssFilter } from 'helmet';

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
        return this.courseRepository.find({ relations: ['category', 'chapters', 'chapters.labs'] });
    }

    public async getById(id: number): Promise<Course | null> {
        return this.courseRepository.findOne({ where: { id }, relations: ['chapters', 'category', 'chapters.labs'] });
    }

    public async create(course: Course): Promise<Course> {
        return this.courseRepository.save(course);
    }
    public async delete(id: number): Promise<DeleteResult> {
        return this.courseRepository.delete({ id });
    }
    public async getByName(name: string): Promise<Course | null> {
        return this.courseRepository.findOne({ where: { name }, relations: ['chapters'] });
    }
    public async getByCategory(categoryId: number): Promise<Course[]> {
        return (await this.getAll()).filter(x => x.category.id === categoryId);
    }

    public getLevel(course: Course): number {
        let levels = course.chapters.map(x => [...x.labs.map(i => i.level as number)]).flat();
        let $level = levels.length ? levels.reduce((x, y) => x + y, 0) / levels.length : 1;
        return Math.round($level);
    }

}

export default new CourseService();