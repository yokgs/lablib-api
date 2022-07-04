import { Request, Response } from 'express';
import { BadRequestException } from '../error/BadRequestException.error';
import { Category } from '../model/category';
import { CategoryService } from '../service/category.service';
import courseService from '../service/course.service';
import { Controller, Get, Post, Body, Delete, Put } from '@nestjs/common';

@Controller('Category')
export class CategoryController {
    private categoryService: CategoryService;
    constructor() {
        this.categoryService = new CategoryService();
    }
    public async currentCategory(req: Request, res: Response) {
        let categoryName = req.params.categoryId.replace(/\-/g, ' ');
        res.status(200).json({ ...await this.categoryService.getByName(categoryName) });
    }
    @Get()
    public async allCategories(req: Request, res: Response) {
        res.status(200).json((await this.categoryService.getAll()).map((category) => ({ ...category })));
    }

    @Post()
    public async createCategory(req: Request, res: Response) {
        const { name, image, description } = req.body;

        if (!name) {
            throw new BadRequestException('Missing required fields');
        }

        if (await this.categoryService.getByName(name)) {
            throw new BadRequestException('Category under this name already exists');
        }


        const category = new Category();
        category.name = name;
        category.image = image;
        category.description = description;
        const newCategory = await this.categoryService.create(category);
        res.status(200).json({ ...newCategory });

    }
    @Get()
    public async categoryById(req: Request, res: Response) {
        const categoryId = Number(req.params.categoryId);
        const category = await this.categoryService.getById(categoryId);

        if (!category) {
            throw new BadRequestException('Category not found');
        }
        res.status(200).json({ ...category });

    }
    @Put()
    public async updateCategory(req: Request, res: Response) {
        const { name, image, description } = req.body;

        const { categoryId } = req.params;
        const category = await this.categoryService.getById(Number(categoryId));

        if (!category) {
            throw new BadRequestException('Category not found');
        }


        category.name = name || category.name;
        category.description = description || category.description;
        category.image = image || category.image;

        const updatedCategory = await this.categoryService.update(Number(categoryId), category);

        return res.status(200).json({ ...updatedCategory });
    }
    @Delete()
    public async deleteCategory(req: Request, res: Response) {
        const { categoryId } = req.params;

        const category = await this.categoryService.getById(Number(categoryId));

        if (!category) {
            throw new BadRequestException('Category not found');
        }

        await this.categoryService.delete(category.id);

        return res.status(200).json({});
    }
    @Get()
    public async allCoursesByCategory(req: Request, res: Response) {
        const { categoryId } = req.params;
        let courses = await courseService.getAll();
        res.status(200).json(courses.filter(c => c.category.id === Number(categoryId)));
    }
}
