import { Router } from "express";
import chapterController from "../controller/chapter.controller";

class ChapterRouter {

    public router: Router;

    constructor() {
        this.router = Router();
        this.routes();
    }

    private routes() {
        this.router.get('/', chapterController.getChapters);
        this.router.post('/', chapterController.createChapter);
        this.router.get('/:chapterId', chapterController.chapterById);
        this.router.put('/:chapterId', chapterController.updateChapter);
        this.router.delete('/:chapterId', chapterController.deleteChapter);
        this.router.get('/:chapterId/list', chapterController.getLabsByChapter);
    }

}

export default new ChapterRouter();