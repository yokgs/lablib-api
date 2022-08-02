import { Request, Response } from 'express';
import { BadRequestException } from '../error/BadRequestException.error';
import { Chapter } from '../model/chapter';
import chapterService from '../service/chapter.service';
import courseService from '../service/course.service';
import { Controller, Get, Post, Delete, Put } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PostChapterDTO } from '../dto/post.chapter.dto';
import { NotFoundException } from '../error/NotFoundException.error';
import labService from '../service/lab.service';
import { PutChapterDTO } from '../dto/put.chapter.dto';
import imageService from '../service/image.service';
import { ImageEntity } from '../model/image';

@ApiTags('Chapter')
@Controller('api/v1/chapter')
export class ChapterController {

    @ApiOperation({ description: 'Get a list of chapters' })
    @Get('/')
    public async getChapters(req: Request, res: Response) {
        let defaultImage = await imageService.getDefaultImage();
        res.status(200).json((await chapterService.getAll()).map((chapter) => ({
            ...chapter, course: chapter.course.name,
            category: chapter.course.category.name,
            labs: chapter.labs.length,
            image: chapter.image || chapter.course?.image || defaultImage
        })));
    }

    @ApiOperation({ description: 'Create a new chapter' })
    @ApiBody({
        type: PostChapterDTO,
        description: 'infos about the new chapter',
    })
    @Post('/')
    public async createChapter(req: Request, res: Response) {
        const { name, course, order, description } = req.body;

        if (!course || !name) {
            throw new BadRequestException('Missing required fields');
        }

        let $course = await courseService.getById(Number(course));

        if (!$course) {
            throw new NotFoundException('Cannot find course id:' + course);
        }

        const chapter = new Chapter();

        if (req.files && req.files.image) {
            let image = req.files.image;
            const newImage = new ImageEntity();
            newImage.content = image.data;
            let $image = await imageService.create(newImage);
            chapter.image = $image.id;
        }

        chapter.name = name;
        chapter.course = $course;
        chapter.description = description;
        const $order = Math.max(...$course.chapters.map(chapter => chapter.order), 1);
        chapter.order = Number(order) || $order;
        const newChapter = await chapterService.create(chapter);
        let defaultImage = await imageService.getDefaultImage();
        res.status(200).json({ ...newChapter, course, labs: 0, image: newChapter.image || course.image || defaultImage, category: chapter.course.category.name });
    }

    @ApiOperation({ description: 'Get details of a chapter' })
    @ApiResponse({
        status: 404,
        description: 'Chapter not found',
    })
    @Get('/:chapterId')
    public async chapterById(req: Request, res: Response) {
        const chapterId = Number(req.params.chapterId);
        const chapter = await chapterService.getById(chapterId);

        if (!chapter) {
            throw new NotFoundException('Chapter not found');
        }
        let defaultImage = await imageService.getDefaultImage();
        res.status(200).json({ ...chapter, course: chapter.course?.name, labs: chapter.labs?.length, image: chapter.image || chapter.course?.image || defaultImage, category: chapter.course?.category?.name });
    }

    @ApiOperation({ description: 'Modify a chapter' })
    @ApiBody({
        type: PutChapterDTO,
        description: 'infos to be updated',
    })
    @ApiResponse({
        status: 404,
        description: 'Chapter not found',
    })
    @Put('/:chapterId')
    public async updateChapter(req: Request, res: Response) {
        const { name, course, order, description } = req.body;

        const { chapterId } = req.params;
        const chapter = await chapterService.getById(Number(chapterId));

        if (!chapter) {
            throw new NotFoundException('Chapter not found');
        }

        if (typeof course !== 'undefined') {
            let $course = await courseService.getById(Number(course));
            if (!$course) {
                throw new NotFoundException('Cannot find course id:' + course);
            }
            chapter.course = $course;
        }

        if (req.files && req.files.image) {
            let image = req.files.image;
            await imageService.delete(chapter.image);
            const newImage = new ImageEntity();
            newImage.content = image.data;
            let $image = await imageService.create(newImage);
            chapter.image = $image.id;
        }

        name && (chapter.name = name);
        description && (chapter.description = description);
        order && (chapter.order = Number(order));
        const updatedChapter = await chapterService.update(Number(chapterId), chapter);
        let defaultImage = await imageService.getDefaultImage();
        return res.status(200).json({ ...updatedChapter, course: updatedChapter.course?.id, labs: updatedChapter.labs?.length, image: updatedChapter.image || updatedChapter.course?.image || defaultImage, category: updatedChapter.course.category.name, });
    }

    @ApiOperation({ description: 'Delete a chapter from the database.' })
    @ApiResponse({
        status: 404,
        description: 'Chapter not found',
    })
    @Delete('/:chapterId')
    public async deleteChapter(req: Request, res: Response) {
        const { chapterId } = req.params;

        const chapter = await chapterService.getById(Number(chapterId));

        if (!chapter) {
            throw new NotFoundException('Chapter not found');
        }

        await imageService.delete(chapter.image);
        await chapterService.delete(chapter.id);

        return res.status(200).json({});
    }

    @ApiOperation({ description: 'Get a list of labs for a given chapter' })
    @ApiResponse({
        status: 404,
        description: 'Chapter not found',
    })
    @Get('/:chapterId/list')
    public async getLabsByChapter(req: Request, res: Response) {
        const { chapterId } = req.params;
        const chapter = await chapterService.getById(Number(chapterId));

        if (!chapter)
            throw new NotFoundException('Chapter not found');

        let labs = await labService.getByChapter(Number(chapterId));

        res.status(200).json(labs.map(l => { return { ...l, steps: l.steps?.length, chapter: l.chapter?.id } }));
    }

}

export default new ChapterController();
