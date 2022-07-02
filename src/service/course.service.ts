import { DeleteResult, Repository } from 'typeorm';
import { PostgresDataSource } from '../config/datasource.config';
import { Course } from '../model/course';

class CourseService {

    private courseRepository: Repository<Course>;

    constructor() {
        this.courseRepository = PostgresDataSource.getRepository(Course);
    }

    public async update(courseId: number, course: Course) {
        return this.courseRepository.save({ ...course, id: courseId });
    }
    public async getAll(): Promise<Course[]> {
        return this.courseRepository.find();
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
}

export default new CourseService();
