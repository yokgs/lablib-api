import { Router } from "express";
import courseController from "../controller/course.controller";

class CourseRouter {

    public router: Router;

    constructor() {
        this.router = Router();
        this.routes();
    }

    private routes() {
        this.router.get('/', courseController.getCourses);
        this.router.post('/', courseController.createCourse);
        this.router.get('/:courseId', courseController.courseById);
        this.router.put('/:courseId', courseController.updateCourse);
        this.router.delete('/:courseId', courseController.deleteCourse);
        this.router.get('/:courseId/list', courseController.getChaptersByCourse);
    }

}

export default new CourseRouter();