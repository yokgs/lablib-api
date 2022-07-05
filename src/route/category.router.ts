import { Router } from "express";
import categoryController, { CategoryController } from "../controller/category.controller";

class CategoryRouter {
    public router: Router;

    constructor() {
        this.router = Router();
        this.routes();
    }

    private routes() {
        this.router.get('/',categoryController.allCategories);
        this.router.post('/', categoryController.createCategory);
        this.router.get('/:categoryId', categoryController.categoryById);
        this.router.put('/:categoryId', categoryController.updateCategory);
        this.router.delete('/:categoryId', categoryController.deleteCategory);
        this.router.get('/:categoryId/list', categoryController.allCoursesByCategory);
    }

}

export default new CategoryRouter();