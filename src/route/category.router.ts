import { Router } from "express";
import categoryController from "../controller/category.controller";
import { filterImage } from "../middleware/filter.image";

class CategoryRouter {

    public router: Router;

    constructor() {
        this.router = Router();
        this.routes();
    }

    private routes() {
        this.router.get('/', categoryController.getCategories);
        this.router.post('/', filterImage, categoryController.createCategory);
        this.router.get('/:categoryId', categoryController.categoryById);
        this.router.put('/:categoryId', filterImage, categoryController.updateCategory);
        this.router.delete('/:categoryId', categoryController.deleteCategory);
        this.router.get('/:categoryId/list', categoryController.getCoursesByCategory);
    }

}

export default new CategoryRouter();