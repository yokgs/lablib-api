import { Router } from "express";
import { CategoryController } from "../controller/category.controller";

class CategoryRouter {
    public router: Router;
    private categoryController: CategoryController;
    constructor() {
        this.router = Router();
        this.categoryController = new CategoryController();
        this.routes();
    }

    private routes() {
        this.router.get('/',this.categoryController.allCategories);
        this.router.post('/', this.categoryController.createCategory);
        this.router.get('/:categoryId', this.categoryController.categoryById);
        this.router.put('/:categoryId', this.categoryController.updateCategory);
        this.router.delete('/:categoryId', this.categoryController.deleteCategory);
        this.router.get('/:categoryId/list', this.categoryController.allCoursesByCategory);
    }

}

export default new CategoryRouter();