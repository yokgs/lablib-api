import { Request, Response } from 'express';
import { BadRequestException } from '../error/BadRequestException.error';
import { Course } from '../model/course';
import { CourseService } from '../service/course.service';
import { CategoryService } from '../service/category.service';
import { ChapterService } from '../service/chapter.service';
import { Controller, Get, Post, Body, Delete, Put } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Course')
@Controller('course')
export class CourseController {

    private categoryService: CategoryService;
    private courseService: CourseService;
    private chapterService: ChapterService;

    constructor() {
        this.categoryService = new CategoryService();
        this.courseService = new CourseService();
        this.chapterService = new ChapterService();
    }

    @Get('/')
    public async allCourses(req: Request, res: Response) {
        res.status(200).json((await this.courseService.getAll()).map((course) => ({ ...course, category: course.category.name })));
    }

    @Post('/')
    public async createCourse(req: Request, res: Response) {
        const { name, category, description, image } = req.body;

        if (!category || !name) {
            throw new BadRequestException('Missing required fields');
        }

        if (await this.courseService.getByName(name)) {
            throw new BadRequestException('Course under this name already exists');
        }

        let $category = await this.categoryService.getByName(category);
        if (!$category) {
            throw new BadRequestException('Cannot find category ' + category);
        }
        const course = new Course();

        course.name = name;
        course.description = description;
        course.image = image;
        course.category = $category;
        const newCourse = await this.courseService.create(course);

        res.status(201).json({ ...newCourse, category: course.category.name });
    }

    @Get('/:courseId')
    public async courseById(req: Request, res: Response) {
        const courseId = Number(req.params.courseId);

        res.status(200).json({ ...await this.courseService.getById(courseId) });
    }

    @Put('/:courseId')
    public async updateCourse(req: Request, res: Response) {
        const { name, category, description, image } = req.body;

        const { courseId } = req.params;
        const course = await this.courseService.getById(Number(courseId));

        if (!course) {
            throw new BadRequestException('Course not found');
        }

        course.image = image || course.image;
        course.description = description || course.description;
        course.name = name || course.name;

        const updatedCourse = await this.courseService.update(Number(courseId), course);

        return res.status(200).json({ ...updatedCourse });
    }

    @Delete('/:courseId')
    public async deleteCourse(req: Request, res: Response) {
        const { courseId } = req.params;

        const course = await this.courseService.getById(Number(courseId));

        if (!course) {
            throw new BadRequestException('Course not found');
        }

        await this.courseService.delete(course.id);

        return res.status(200).json({});
    }

    @Get('/:courseId/list')
    public async allChaptersByCourse(req: Request, res: Response) {
        const { courseId } = req.params;
        res.status(200).json({ ...await this.chapterService.getByCourse(Number(courseId)) });
    }

}
export default new CourseController();