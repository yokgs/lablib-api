import { Request, Response } from 'express';
import moment from 'moment';
import { BadRequestException } from '../error/BadRequestException.error';
import { Category } from '../model/category';
import categoryService from '../service/category.service';
import courseService from '../service/course.service';

class CategoryController {
    public async currentCategory(req: Request, res: Response) {
        let categoryName = req.params.category.replace(/\-/g, ' ');
        res.status(200).json({ ...await categoryService.getByName(categoryName) });
    }

    public async allCategories(req: Request, res: Response) {
        res.status(200).json((await categoryService.getAll()).map((category) => ({ ...category })));
    }

    public async createCategory(req: Request, res: Response) {
        const { name, image, description } = req.body;

        if (!name) {
            throw new BadRequestException('Missing required fields');
        }

        if (await categoryService.getByName(name)) {
            throw new BadRequestException('Category under this name already exists');
        }


        const category = new Category();
        category.name = name;
        category.image = image;
        category.description = description;
        const newCategory = await categoryService.create(category);
        res.status(200).json({ ...newCategory });

    }

    public async categoryById(req: Request, res: Response) {
        const categoryId = Number(req.params.id);

        res.status(200).json({ ...await categoryService.getById(categoryId) });
    }

    public async updateCategory(req: Request, res: Response) {
        const { name, image } = req.body;

        const { categoryId } = req.params;
        const category = await categoryService.getById(Number(categoryId));

        if (!category) {
            throw new BadRequestException('Category not found');
        }

        if (!name || !image) {
            throw new BadRequestException('Missing required fields');
        }

        category.image = image;
        category.name = name;

        const updatedCategory = await categoryService.update(Number(categoryId), category);

        return res.status(200).json({ ...updatedCategory });
    }
    public async deleteCategory(req: Request, res: Response) {
        const { categoryId } = req.params;

        const category = await categoryService.getById(Number(categoryId));

        if (!category) {
            throw new BadRequestException('Category not found');
        }

        await categoryService.delete(Number(category));

        return res.status(200).json({});
    }
    public async allCoursesByCategory(req: Request, res: Response) {
        const { categoryId } = req.params;
        let courses = await courseService.getAll();
        res.status(200).json(courses.filter(c => c.category.id === Number(categoryId)));
    }
}

export default new CategoryController();
