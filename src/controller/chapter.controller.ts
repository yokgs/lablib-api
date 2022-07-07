import { Request, Response } from 'express';
import { BadRequestException } from '../error/BadRequestException.error';
import { Chapter } from '../model/chapter';
import { ChapterService } from '../service/chapter.service';
import { CourseService } from '../service/course.service';
import { Controller, Get, Post, Body, Delete, Put } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Chapter')
@Controller('api/v1/chapter')
export class ChapterController {

    private chapterService: ChapterService;
    private courseService: CourseService;
    constructor() {
        this.chapterService = new ChapterService();
        this.courseService = new CourseService();
    }
    @ApiOperation({ description: 'Get a list of chapters' })
    @Get('/')
    public async allChapters(req: Request, res: Response) {
        res.status(200).json((await this.chapterService.getAll()).map((chapter) => ({ ...chapter, course: chapter.course.name })));
    }

    @ApiOperation({ description: 'Create a new chapter' })
    @Post('/')
    public async createChapter(req: Request, res: Response) {
        const { name, course, description, image } = req.body;

        if (!description || !course || !name) {
            throw new BadRequestException('Missing required fields');
        }

        if (await this.chapterService.getByName(name)) {
            throw new BadRequestException('Chapter under this name already exists');
        }
        let $course = await this.courseService.getByName(course);
        if (!$course) {
            throw new BadRequestException('Cannot find course ' + course);
        }
        const chapter = new Chapter();

        chapter.name = name;
        chapter.course = $course;
        const newChapter = await this.chapterService.create(chapter);

        res.status(201).json({ ...newChapter, course: chapter.course.name });
    }
@ApiOperation({ description: 'Get details of a chapter' })
    @Get('/:chapterId')
    public async chapterById(req: Request, res: Response) {
        const chapterId = Number(req.params.chapterId);
        const chapter = await this.chapterService.getById(chapterId);

        if (!chapter) {
            throw new BadRequestException('Chapter not found');
        }
        res.status(200).json({ ...chapter });
    }

    @ApiOperation({ description: 'Modify a chapter' })
    @Put('/:chapterId')
    public async updateChapter(req: Request, res: Response) {
        const { name, course } = req.body;

        const { chapterId } = req.params;
        const chapter = await this.chapterService.getById(Number(chapterId));

        if (!chapter) {
            throw new BadRequestException('Chapter not found');
        }
        let $course = await this.courseService.getByName(course);
        if (!$course) {
            throw new BadRequestException('Cannot find course ' + course);
        }
        chapter.name = name || chapter.name;
        chapter.course = $course || chapter.course;
        const updatedChapter = await this.chapterService.update(Number(chapterId), chapter);

        return res.status(200).json({ ...updatedChapter });
    }

    @ApiOperation({ description: 'Delete a chapter from the database.' })
    @Delete('/:chapterId')
    public async deleteChapter(req: Request, res: Response) {
        const { chapterId } = req.params;

        const chapter = await this.chapterService.getById(Number(chapterId));

        if (!chapter) {
            throw new BadRequestException('Chapter not found');
        }

        await this.chapterService.delete(chapter.id);

        return res.status(200).json({});
    }

    @Get('/:chapterId/list')
    allLabsByChapter(arg0: string, allLabsByChapter: any) {
        throw new Error("Method not implemented.");
    }

}

export default new ChapterController();
