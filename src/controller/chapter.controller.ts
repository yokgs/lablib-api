import { Request, Response } from 'express';
import moment from 'moment';
import { BadRequestException } from '../error/BadRequestException.error';
import { Chapter } from '../model/chapter';
import chapterService from '../service/chapter.service';
import courseService from '../service/course.service';

class ChapterController {
    allLabsByChapter(arg0: string, allLabsByChapter: any) {
        throw new Error("Method not implemented.");
    }
    public async currentChapter(req: Request, res: Response) {
        let chapterName = req.params.chapter.replace(/\-/g, ' ');
        res.status(200).json({ ...await chapterService.getByName(chapterName) });
    }

    public async allChapters(req: Request, res: Response) {
        res.status(200).json((await chapterService.getAll()).map((chapter) => ({ ...chapter, course: chapter.course.name })));
    }

    public async createChapter(req: Request, res: Response) {
        const { name, course, description, image } = req.body;

        if (!description || !course || !name) {
            throw new BadRequestException('Missing required fields');
        }

        if (await chapterService.getByName(name)) {
            throw new BadRequestException('Chapter under this name already exists');
        }

        const chapter = new Chapter();

        chapter.name = name;
        chapter.course = await courseService.getByName(course);
        const newChapter = await chapterService.create(chapter);

        res.status(200).json({ ...newChapter, course: chapter.course.name });
    }

    public async chapterById(req: Request, res: Response) {
        const chapterId = Number(req.params.chapterId);

        res.status(200).json({ ...await chapterService.getById(chapterId) });
    }

    public async updateChapter(req: Request, res: Response) {
        const { name } = req.body;

        const { chapterId } = req.params;
        const chapter = await chapterService.getById(Number(chapterId));

        if (!chapter) {
            throw new BadRequestException('Chapter not found');
        }

        chapter.name = name || chapter.name;

        const updatedChapter = await chapterService.update(Number(chapterId), chapter);

        return res.status(200).json({ ...updatedChapter });
    }
    public async deleteChapter(req: Request, res: Response) {
        const { chapterId } = req.params;

        const chapter = await chapterService.getById(Number(chapterId));

        if (!chapter) {
            throw new BadRequestException('Chapter not found');
        }

        await chapterService.delete(chapter.id);

        return res.status(200).json({});
    }
    
}

export default new ChapterController();
