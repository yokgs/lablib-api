import { Router } from "express";
import categoryController from "../controller/category.controller";

class CategoryRouter {
    public router: Router;

    constructor() {
        this.router = Router();
        this.routes();
    }

    private routes() {
        this.router.get('/',categoryController.allCategories);
        this.router.post('/', categoryController.createCategory);
        this.router.get('/:categoryId', categoryController.currentCategory);
        this.router.put('/:categoryId', categoryController.updateCategory);
        this.router.delete('/:categoryId', categoryController.deleteCategory);
    }

}

export default new CategoryRouter();