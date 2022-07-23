import { Request, Response } from 'express';
import { BadRequestException } from '../error/BadRequestException.error';
import { Course } from '../model/course';
import courseService from '../service/course.service';
import categoryService from '../service/category.service';
import chapterService from '../service/chapter.service';
import { Controller, Get, Post, Body, Delete, Put } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { NotFoundException } from '../error/NotFoundException.error';
import { PostCourseDTO } from '../dto/post.course.dto';
import { PutCourseDTO } from '../dto/put.course.dto';
import imageService from '../service/image.service';
import { ImageEntity } from '../model/image';

@ApiTags('Course')
@Controller('api/v1/course')
export class CourseController {
    @ApiOperation({ description: 'Get a list of courses' })
    @Get('/')
    public async getCourses(req: Request, res: Response) {
        let courses = await courseService.getAll();

        let $courses = courses.map(course => {
            return {
                ...course,
                category: course.category.name,
                chapters: course.chapters.length,
                level: courseService.getLevel(course)
            }
        })

        res.status(200).json($courses);
    }

    @ApiOperation({ description: 'Create a new course' })
    @ApiBody({
        type: PostCourseDTO,
        description: 'infos about the new course',
    })
    @Post('/')
    public async createCourse(req: Request, res: Response) {
        const { name, category, description } = req.body;
        if (!category || !name) {
            throw new BadRequestException('Missing required fields');
        }

        if (await courseService.getByName(name)) {
            throw new BadRequestException('Course under this name already exists');
        }

        let $category = await categoryService.getById(Number(category));
        if (!$category) {
            throw new NotFoundException('Cannot find category id:' + category);
        }
        const course = new Course();

        let $image = { id: null };
        if (req.files && req.files.image) {
            let image = req.files.image;
            const newImage = new ImageEntity();
            newImage.content = image.data;
            $image = await imageService.create(newImage);
        }

        course.name = name;
        course.description = description;
        course.image = $image.id;
        course.category = $category;
        const newCourse = await courseService.create(course);

        res.status(200).json({ ...newCourse, category: course.category.name, chapters: 0 });
    }

    @ApiOperation({ description: 'Get details of a course' })
    @ApiResponse({
        status: 404,
        description: 'Course not found',
    })
    @Get('/:courseId')
    public async courseById(req: Request, res: Response) {
        const courseId = Number(req.params.courseId);
        let course = await courseService.getById(courseId);
        if (!course) {
            throw new NotFoundException(`Course not found`);
        }

        res.status(200).json({
            ...course,
            category: course.category.name,
            chapters: course.chapters.length,
            level: courseService.getLevel(course)
        });
    }

    @ApiOperation({ description: 'Modify a course' })
    @ApiBody({
        type: PutCourseDTO,
        description: 'infos to be updated',
    })
    @ApiResponse({
        status: 404,
        description: 'Course not found',
    })
    @Put('/:courseId')
    public async updateCourse(req: Request, res: Response) {
        const { name, category, description } = req.body;
        const { courseId } = req.params;
        const course = await courseService.getById(Number(courseId));

        if (!course) {
            throw new NotFoundException('Course not found');
        }

        if (req.files && req.files.image) {
            let image = req.files.image;
            await imageService.delete(course.image);
            const newImage = new ImageEntity();
            newImage.content = image.data;
            let $image = await imageService.create(newImage);
            course.image = $image.id;
        }
        let $course = await courseService.getByName(name)
        if ($course && course.name != name) {
            throw new BadRequestException('Course under this name already exists');
        }

        if (typeof category !== 'undefined') {
            let $category = await categoryService.getById(Number(category));
            if (!$category) {
                throw new NotFoundException('Cannot find category ' + category);
            }
            course.category = $category;
        }
        description && (course.description = description);
        name && (course.name = name);

        const updatedCourse = await courseService.update(Number(courseId), course);

        return res.status(200).json({ ...updatedCourse, category: updatedCourse.category?.id, chapters: updatedCourse.chapters?.length });
    }

    @ApiOperation({ description: 'Delete a course from the database.' })
    @ApiResponse({
        status: 404,
        description: 'Course not found',
    })
    @Delete('/:courseId')
    public async deleteCourse(req: Request, res: Response) {
        const { courseId } = req.params;

        const course = await courseService.getById(Number(courseId));

        if (!course) {
            throw new NotFoundException('Course not found');
        }

        await imageService.delete(course.image);
        await courseService.delete(course.id);

        return res.status(200).json({});
    }

    @ApiOperation({ description: 'Get a list of chapters for a given course' })
    @ApiResponse({
        status: 404,
        description: 'Course not found',
    })
    @Get('/:courseId/list')
    public async getChaptersByCourse(req: Request, res: Response) {
        const { courseId } = req.params;
        const course = await courseService.getById(Number(courseId));

        if (!course)
            throw new NotFoundException('Course not found');

        let chapters = await chapterService.getByCourse(Number(courseId));
        res.status(200).json(chapters.map(c => { return { ...c, labs: c.labs?.length, course: c.course?.id} }));
    }

}
export default new CourseController();