import { Request, Response } from 'express';
import { BadRequestException } from '../error/BadRequestException.error';
import { Chapter } from '../model/chapter';
import chapterService from '../service/chapter.service';
import courseService from '../service/course.service';
import { Controller, Get, Post, Body, Delete, Put } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PostChapterDTO } from '../dto/post.chapter.dto';
import { NotFoundException } from '../error/NotFoundException.error';
import labService from '../service/lab.service';
import { PutChapterDTO } from '../dto/put.chapter.dto';

@ApiTags('Chapter')
@Controller('api/v1/chapter')
export class ChapterController {

    @ApiOperation({ description: 'Get a list of chapters' })
    @Get('/')
    public async getChapters(req: Request, res: Response) {
        res.status(200).json((await chapterService.getAll()).map((chapter) => ({ ...chapter, course: chapter.course.name, labs: chapter.labs.length })));
    }

    @ApiOperation({ description: 'Create a new chapter' })
    @ApiBody({
        type: PostChapterDTO,
        description: 'infos about the new chapter',
    })
    @Post('/')
    public async createChapter(req: Request, res: Response) {
        const { name, course, order } = req.body;

        if (!course || !name) {
            throw new BadRequestException('Missing required fields');
        }

        let $course = await courseService.getById(Number(course));
        if (!$course) {
            throw new NotFoundException('Cannot find course id:' + course);
        }

        const chapter = new Chapter();

        chapter.name = name;
        chapter.course = $course;

        chapter.order = order || (Math.max(...$course.chapters.map(chapter => chapter.order)) + 1);
        const newChapter = await chapterService.create(chapter);

        res.status(200).json({ ...newChapter, course });
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
        res.status(200).json({ ...chapter, course: chapter.course.name, labs: chapter.labs.length });
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
        const { name, course } = req.body;

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
        name && (chapter.name = name);
        const updatedChapter = await chapterService.update(Number(chapterId), chapter);

        return res.status(200).json({ ...updatedChapter });
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
        res.status(200).json(labs);
    }

}

export default new ChapterController();
