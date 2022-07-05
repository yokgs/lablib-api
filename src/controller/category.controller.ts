import { Request, Response } from 'express';
import { BadRequestException } from '../error/BadRequestException.error';
import { Category } from '../model/category';
import categoryService, { CategoryService } from '../service/category.service';
import courseService, { CourseService } from '../service/course.service';
import { Controller, Get, Post, Body, Delete, Put } from '@nestjs/common';
import { ApiBadRequestResponse, ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PostCategoryDTO } from '../dto/post.category.dto'

@ApiTags('Category')
@Controller('category')
export class CategoryController {

    private categoryService = categoryService;
    private courseService = courseService;

    @ApiOperation({ description: 'Get a list of categories' })
    @ApiOkResponse({
        description: 'List of categories',
        schema: {
            type: 'Category[]',
            example: [{ id: 5, name: "Web Development", description: 'Description of the Web Development category' }]
        }
    })
    @Get('/')
    public async allCategories(req: Request, res: Response) {
        res.status(200).json((await this.categoryService.getAll()).map((category) => ({ ...category })));
    }


    @ApiOperation({ description: 'Create a new category' })
    @ApiBody({
        type: PostCategoryDTO,
        description: 'infos about the new category',
        })
    @ApiOkResponse(
        {
            description: 'Category created',
            schema: {
                type: 'Category',
                example: { id: 5, name: "Web Development", description: 'Description of the Web Development category' }
            }
        }
    )
    @ApiBadRequestResponse({
        description: 'returned if the body request has missing required fields or existing category has the given name',
    })
    @Post('/')
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
        res.status(201).json({ ...newCategory });
    }

    @ApiOperation({ description: 'Get details of a category' })
    @Get('/:categoryId')
    public async categoryById(req: Request, res: Response) {
        const categoryId = Number(req.params.categoryId);
        const category = await this.categoryService.getById(categoryId);

        if (!category) {
            throw new BadRequestException('Category not found');
        }
        res.status(200).json({ ...category });
    }


    @ApiOperation({ description: 'Modify a category' })
    @Put('/:categoryId')
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


    @ApiOperation({ description: 'Delete a category from the database.' })
    @Delete('/:categoryId')
    public async deleteCategory(req: Request, res: Response) {
        const { categoryId } = req.params;

        const category = await this.categoryService.getById(Number(categoryId));

        if (!category) {
            throw new BadRequestException('Category not found');
        }

        await this.categoryService.delete(category.id);

        return res.status(200).json({});
    }


    @ApiOperation({ description: 'Get a list of courses for a given category' })
    @Get('/:categoryId/list')
    public async allCoursesByCategory(req: Request, res: Response) {
        const { categoryId } = req.params;
        let courses = courseService.getByCategory(Number(categoryId));
        res.status(200).json({ ...courses });
    }
}

export default new CategoryController();