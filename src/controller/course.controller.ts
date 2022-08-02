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
import userService from '../service/user.service';
import { Not } from 'typeorm';

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
                category: course.category?.name,
                chapters: course.chapters?.length,
                level: courseService.getLevel(course),
                followers: course.followers?.length
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

        res.status(200).json({ ...newCourse, category: course.category.name, chapters: 0, followers: 0 });
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
            category: course.category?.name,
            chapters: course.chapters?.length,
            followers: course.followers?.length,
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
        if (name) {
            let $course = await courseService.getByName(name)
            if ($course && course.name != name) {
                throw new BadRequestException('Course under this name already exists');
            }
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

        return res.status(200).json({ ...updatedCourse, category: updatedCourse.category?.id, chapters: updatedCourse.chapters?.length, followers: updatedCourse.followers?.length });
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
    @ApiOperation({ description: 'Add course to favorites.' })
    @ApiResponse({
        status: 404,
        description: 'Course not found',
    })
    @Post('/:courseId/like')
    public async addCourseToFavorites(req: Request, res: Response) {
        const { courseId } = req.params;
        const { userId } = req.currentUser;
        let user = await userService.getById(userId);
        if (!user) {
            throw new NotFoundException('Invalid user');
        }

        const course = await courseService.getById(Number(courseId));

        if (!course) {
            throw new NotFoundException('Course not found');
        }

        user.favorites.push(course);
        await userService.update(userId, user);
        return res.status(200).json({});
    }
    @ApiOperation({ description: 'Remove a course from favorites.' })
    @ApiResponse({
        status: 404,
        description: 'Course not found',
    })
    @Delete('/:courseId/like')
    public async removeCourseFromFavorites(req: Request, res: Response) {
        const { courseId } = req.params;
        const { userId } = req.currentUser;
        let user = await userService.getById(userId);
        if (!user) {
            throw new NotFoundException('Invalid user');
        }

        const course = await courseService.getById(Number(courseId));

        if (!course) {
            throw new NotFoundException('Course not found');
        }

        user.favorites = user.favorites.filter(favorite => favorite.id !== course.id);
        await userService.update(userId, user);

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
        res.status(200).json(chapters.sort((x, y) => x.order - y.order).map(c => { return { ...c, labs: c.labs?.length, course: c.course?.id } }));
    }
    @ApiOperation({ description: 'Get a list of last added courses' })
    @Get('/latest/:count')
    public async getlatestCourses(req: Request, res: Response) {
        const { count } = req.params;
        const courses = await courseService.getCount(Number(count));
        res.status(200).json(courses.map(c => { return { ...c, category: c.category?.id, chapters: c.chapters?.length, level: courseService.getLevel(c) } }));
    }
    @ApiOperation({ description: 'Get a list of favorites courses' })
    @Get('/favorites/:count')
    public async getFavoriteCourses(req: Request, res: Response) {
        const { count } = req.params;
        let { userId } = req.currentUser;
        let user = await userService.getById(userId);
        if (!user) {
            throw new NotFoundException('Invalid user');
        }
        const courses = user.favorites?.slice(0, Number(count));
        res.status(200).json(user);//courses?.map(c => { return { ...c, category: c.category?.id, chapters: c.chapters?.length, level: courseService.getLevel(c), followers: c.followers?.length} }));
    }

    @ApiOperation({ description: 'Get a list of recommendations for a course' })
    @Get('/suggestions/:count')
    public async getSuggestions(req: Request, res: Response) {
        const { count } = req.params;
        let { userId } = req.currentUser;
        let user = await userService.getByIdWithDeepFollowers(userId);
        if (!user) {
            throw new NotFoundException('Invalid user');
        }
        const courses = user.favorites.map(c => c.followers.map(f => f.favorites.map($ => $.id))).flat(2);
        let i = [], cs = [];
        courses.forEach(c => {
            if (!(cs.includes(c))) { i.push(0); cs.push(c); }
            i[cs.indexOf(c)] += 1;
        });

        let used = user.favorites.map(c => c.id), max = 0, mxi;
        for (let y of cs) {
            for (let j of cs) {
                if (used.includes(j)) continue;
                let $ = i[cs.indexOf(j)];
                if ($ > max) { max = $; mxi = j; }
            }
            used.push(mxi);
            if (used.length - user.favorites.length == Number(count)) break;
        }

        res.status(200).json(used.slice(user.favorites.length));
    }


}
export default new CourseController();