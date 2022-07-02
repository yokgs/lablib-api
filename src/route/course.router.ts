import { Router } from "express";
import courseController from "../controller/course.controller";

class CourseRouter {
    public router: Router;

    constructor() {
        this.router = Router();
        this.routes();
    }

    private routes() {
        this.router.get('/',courseController.allCourses);
        this.router.post('/', courseController.createCourse);
        this.router.get('/:courseId', courseController.currentCourse);
        this.router.put('/:courseId', courseController.updateCourse);
        this.router.delete('/:courseId', courseController.deleteCourse);
    }

}

export default new CourseRouter();