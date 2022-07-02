import { Request, Response } from 'express';
import { BadRequestException } from '../error/BadRequestException.error';
import { Course } from '../model/course';
import courseService from '../service/course.service';
import categoryService from '../service/category.service';

class CourseController {
    public async currentCourse(req: Request, res: Response) {
        let courseName = req.params.course.replace(/\-/g, ' ');
        res.status(200).json({ ...await courseService.getByName(courseName) });
    }

    public async allCourses(req: Request, res: Response) {
        res.status(200).json((await courseService.getAll()).map((course) => ({ ...course, category: course.category.name })));
    }

    public async createCourse(req: Request, res: Response) {
        const { name, category, description, image } = req.body;

        if (!description || !category || !name) {
            throw new BadRequestException('Missing required fields');
        }

        if (await courseService.getByName(name)) {
            throw new BadRequestException('Course under this name already exists');
        }

        const course = new Course();

        course.name = name;
        course.description = description;
        course.image = image;
        course.category = await categoryService.getByName(category);
        const newCourse = await courseService.create(course);

        res.status(200).json({ ...newCourse, category: course.category.name });
    }

    public async courseById(req: Request, res: Response) {
        const courseId = Number(req.params.id);

        res.status(200).json({ ...await courseService.getById(courseId) });
    }

    public async updateCourse(req: Request, res: Response) {
        const { name, category, description, image } = req.body;

        const { courseId } = req.params;
        const course = await courseService.getById(Number(courseId));

        if (!course) {
            throw new BadRequestException('Course not found');
        }

        if (!name || !category || !description || !image) {
            throw new BadRequestException('Missing required fields');
        }

        course.image = image;
        course.description = description;
        course.name = name;


        const updatedCourse = await courseService.update(Number(courseId), course);

        return res.status(200).json({ ...updatedCourse });
    }
    public async deleteCourse(req: Request, res: Response) {
        const { courseId } = req.params;

        const course = await courseService.getById(Number(courseId));

        if (!course) {
            throw new BadRequestException('Course not found');
        }

        await courseService.delete(Number(course));

        return res.status(200).json({});
    }
}

export default new CourseController();
