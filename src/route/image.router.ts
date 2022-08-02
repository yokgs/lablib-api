import { Router } from "express";
import imageController from "../controller/image.controller";

class SearchRouter {

    public router: Router;

    constructor() {
        this.router = Router();
        this.routes();
    }

    private routes() {
        this.router.get('/:uuid', imageController.getImage);
        this.router.get('/:uuid/:width', imageController.getAndResizeImage);
        this.router.post('/', imageController.setDefaultImage);
    }

}

export default new SearchRouter();