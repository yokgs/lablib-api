import { Router } from "express";
import searchController from "../controller/search.controller";

class SearchRouter {

    public router: Router;

    constructor() {
        this.router = Router();
        this.routes();
    }

    private routes() {
        this.router.get('/', searchController.getResults);
        this.router.get('/category', searchController.getCategories);
        this.router.get('/course', searchController.getCourses);
        this.router.get('/chapter', searchController.getChapters);
    }

}

export default new SearchRouter();