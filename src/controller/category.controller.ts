import { Request, Response } from 'express';
import { BadRequestException } from '../error/BadRequestException.error';
import { Category } from '../model/category';
import categoryService from '../service/category.service';
import courseService from '../service/course.service';
import { Controller, Get, Post, Body, Delete, Put } from '@nestjs/common';
import { ApiBadRequestResponse, ApiBody, ApiOkResponse, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PostCategoryDTO } from '../dto/post.category.dto'
import { NotFoundException } from '../error/NotFoundException.error';

@ApiTags('Category')
@Controller('api/v1/category')
export class CategoryController {

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
        res.status(200).json((await categoryService.getAll()).map((category) => ({ ...category })));
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
    @ApiResponse({
        status: 401,
        description: 'returned if the body request has missing required fields or existing category already has the given name',
    })
    @Post('/')
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

    @ApiOperation({ description: 'Get details of a category' })
    @ApiResponse({
        status: 404,
        description: 'Category not found',
    })
    @Get('/:categoryId')
    public async categoryById(req: Request, res: Response) {
        const categoryId = Number(req.params.categoryId);
        const category = await categoryService.getById(categoryId);

        if (!category) {
            throw new NotFoundException('Category not found');
        }
        res.status(200).json({ ...category });
    }


    @ApiOperation({ description: 'Modify a category' })
    @Put('/:categoryId')
    public async updateCategory(req: Request, res: Response) {
        const { name, image, description } = req.body;

        const { categoryId } = req.params;
        const category = await categoryService.getById(Number(categoryId));

        if (!category) {
            throw new NotFoundException('Category not found');
        }

        category.name = name || category.name;
        category.description = description || category.description;
        category.image = image || category.image;

        const updatedCategory = await categoryService.update(Number(categoryId), category);

        return res.status(200).json({ ...updatedCategory });
    }


    @ApiOperation({ description: 'Delete a category from the database.' })
    @ApiOkResponse(
        {
            description: 'category is deleted successfully',
            schema: {
                type: 'empty object',
                example: {}
            }
        }
    )
    @Delete('/:categoryId')
    public async deleteCategory(req: Request, res: Response) {
        const { categoryId } = req.params;

        const category = await categoryService.getById(Number(categoryId));

        if (!category) {
            throw new NotFoundException('Category not found');
        }

        await categoryService.delete(category.id);

        return res.status(200).json({});
    }


    @ApiOperation({ description: 'Get a list of courses for a given category' })
    @ApiOkResponse(
        {
            description: 'Courses list',
            schema: {
                type: 'Course[]',
                example: [{ id: 3, name: "ExpressJS", description: 'Course\'s description' }]
            }
        }
    )
    @Get('/:categoryId/list')
    public async allCoursesByCategory(req: Request, res: Response) {
        const { categoryId } = req.params;
        const category = await categoryService.getById(Number(categoryId));

        if (!category) {
            throw new NotFoundException('Category not found');
        }

        let courses = await courseService.getByCategory(Number(categoryId));
        res.status(200).json(courses);
    }
}

export default new CategoryController();