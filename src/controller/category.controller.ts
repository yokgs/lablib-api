import { Request, Response } from 'express';
import { BadRequestException } from '../error/BadRequestException.error';
import { Category } from '../model/category';
import categoryService from '../service/category.service';
import courseService from '../service/course.service';
import { Controller, Get, Post, Body, Delete, Put } from '@nestjs/common';
import { ApiBadRequestResponse, ApiBody, ApiOkResponse, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PostCategoryDTO } from '../dto/post.category.dto'
import { NotFoundException } from '../error/NotFoundException.error';
import { PutCategoryDTO } from '../dto/put.category.dto';
import { number } from 'joi';
import { ImageEntity } from '../model/image';
import imageService from '../service/image.service';
import console from 'console';

@ApiTags('Category')
@Controller('api/v1/category')
export class CategoryController {

    @ApiOperation({ description: 'Get a list of categories' })
    @ApiOkResponse({
        description: 'List of categories',
        type: Category,
    })
    @Get('/')
    public async getCategories(req: Request, res: Response) {
        res.status(200).json((await categoryService.getAll()).map((category) => ({ ...category, courses: category.courses.length })));
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
        const { name, description } = req.body;
console.log(name, description)
        if (!name) {
            throw new BadRequestException('Missing required fields');
        }

        if (await categoryService.getByName(name)) {
            throw new BadRequestException('Category under this name already exists');
        }
        let $image = {id: null};
        if (req.files && req.files.image) {
            let image = req.files.image;
            const newImage = new ImageEntity();
            newImage.content = image.data;
            $image = await imageService.create(newImage);
        }

        const category = new Category();
        category.name = name;
        category.image = $image.id;

        category.description = description;
        const newCategory = await categoryService.create(category);
        res.status(200).json({ ...newCategory });
    }

    @ApiOperation({ description: 'Get details of a category' })
    @ApiParam({
        name: 'categoryId',
        description: 'id of the category',
        allowEmptyValue: false,
        type: number,
        examples: { a: { summary: 'id of the category is 5', value: 5 } }
    })
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
    @ApiParam({
        name: 'categoryId',
        description: 'id of the category',
        allowEmptyValue: false,
        type: number,
        examples: { a: { summary: 'id of the category is 5', value: 5 } }
    })
    @ApiBody({
        type: PutCategoryDTO,
        description: 'infos to be updated',
    })
    @ApiResponse({
        status: 404,
        description: 'Category not found',
    })
    @Put('/:categoryId')
    public async updateCategory(req: Request, res: Response) {
        const { name, description } = req.body;
        const { categoryId } = req.params;
        const category = await categoryService.getById(Number(categoryId));

        if (!category) {
            throw new NotFoundException('Category not found');
        }
        if (await categoryService.getByName(name)) {
            throw new BadRequestException('Category under this name already exists');
        }
        name && (category.name = name);
        description && (category.description = description);
        if (req.files && req.files.image) {
            let image = req.files.image;
            await imageService.delete(category.image);
            const newImage = new ImageEntity();
            newImage.content = image.data;
            let $image = await imageService.create(newImage);
            category.image = $image.id;
        }

        const updatedCategory = await categoryService.update(Number(categoryId), category);

        return res.status(200).json({ ...updatedCategory });
    }


    @ApiOperation({ description: 'Delete a category from the database.' })
    @ApiParam({
        name: 'categoryId',
        description: 'id of the category',
        allowEmptyValue: false,
        type: number,
        examples: { a: { summary: 'id of the category is 5', value: 5 } }
    })
    @ApiOkResponse({
        description: 'category is deleted successfully',
        schema: {
            type: 'empty object',
            example: {}
        }
    })
    @ApiResponse({
        status: 404,
        description: 'Category not found',
    })
    @Delete('/:categoryId')
    public async deleteCategory(req: Request, res: Response) {
        const { categoryId } = req.params;

        const category = await categoryService.getById(Number(categoryId));

        await imageService.delete(category.image);

        if (!category) {
            throw new NotFoundException('Category not found');
        }

        await categoryService.delete(category.id);

        return res.status(200).json({});
    }


    @ApiOperation({ description: 'Get a list of courses for a given category' })
    @ApiParam({
        name: 'categoryId',
        description: 'id of the category',
        allowEmptyValue: false,
        type: number,
        examples: { a: { summary: 'id of the category is 5', value: 5 } }
    })
    @ApiOkResponse({
        description: 'Courses list',
        schema: {
            type: 'Course[]',
            example: [{ id: 3, name: "ExpressJS", description: 'Course\'s description' }]
        }
    })
    @ApiResponse({
        status: 404,
        description: 'Category not found',
    })
    @Get('/:categoryId/list')
    public async getCoursesByCategory(req: Request, res: Response) {
        const { categoryId } = req.params;
        const category = await categoryService.getById(Number(categoryId));

        if (!category)
            throw new NotFoundException('Category not found');

        let courses = await courseService.getByCategory(Number(categoryId));
        res.status(200).json(courses);
    }
}

export default new CategoryController();