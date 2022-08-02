import { Router } from "express";
import courseController from "../controller/course.controller";
import { ensureAuthenticated } from "../middleware/ensureAuthenticated.middleware";

class CourseRouter {

    public router: Router;

    constructor() {
        this.router = Router();
        this.routes();
    }

    private routes() {
        this.router.get('/', courseController.getCourses);
        this.router.post('/', courseController.createCourse);
        this.router.get('/latest/:count', courseController.getlatestCourses);
        this.router.get('/suggestions/:count', ensureAuthenticated, courseController.getSuggestions);
        this.router.get('/favorites/:count', ensureAuthenticated, courseController.getFavoriteCourses);
        this.router.get('/:courseId', courseController.courseById);
        this.router.put('/:courseId', courseController.updateCourse);
        this.router.delete('/:courseId', courseController.deleteCourse);
        this.router.get('/:courseId/list', courseController.getChaptersByCourse);
        this.router.post('/:courseId/like', ensureAuthenticated, courseController.addCourseToFavorites);
        this.router.delete('/:courseId/like', ensureAuthenticated, courseController.removeCourseFromFavorites);
    }

}

export default new CourseRouter();