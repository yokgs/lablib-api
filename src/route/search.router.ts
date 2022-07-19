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
        this.router.post('/category', searchController.getCategories);
        this.router.post('/course', searchController.getCourses);
        this.router.post('/chapter', searchController.getChapters);
    }

}

export default new SearchRouter();