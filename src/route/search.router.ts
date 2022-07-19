import { Router } from "express";
import searchController from "../controller/search.controller";

class SearchRouter {

    public router: Router;

    constructor() {
        this.router = Router();
        this.routes();
    }

    private routes() {
        this.router.post('/', searchController.getResults);
        this.router.get('/', searchController.getResultsQ);
        this.router.post('/category', searchController.getCategories);
        this.router.get('/category', searchController.getCategoriesQ);
        this.router.post('/course', searchController.getCourses);
        this.router.get('/course', searchController.getCoursesQ);
        this.router.post('/chapter', searchController.getChapters);
        this.router.get('/chapter', searchController.getChaptersQ);
    }

}

export default new SearchRouter();