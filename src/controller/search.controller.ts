import { Request, Response } from 'express';
import { Category } from '../model/category';
import searchService from '../service/search.service';
import { Controller, Get, Post, Body, Delete, Put } from '@nestjs/common';
import { ApiBadRequestResponse, ApiBody, ApiOkResponse, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SearchResult } from '../types/searchresult'
import { Course } from '../model/course';
import { Chapter } from '../model/chapter';

@ApiTags('Search')
@Controller('api/v1/search')
export class SearchController {

    @ApiOperation({ description: 'Get list of entities that match the given search query' })
    @ApiOkResponse({
        description: 'List of the selected entities',
        type: SearchResult,
    })
    @Get('/')
    public async getResults(req: Request, res: Response) {
        const { search } = req.body;

        const categories = searchService.getCategories(search.text);
        const courses = searchService.getCourses(search.text);
        const chapters = searchService.getChapters(search.text);

        res.status(200).json({ categories, courses, chapters, input: search.text });
    }

    @ApiOperation({ description: 'Get list of categories that match the given search query' })
    @ApiOkResponse({
        description: 'List of the categories',
        type: Array<Category>,
    })
    @Get('/category')
    public async getCategories(req: Request, res: Response) {
        const { search } = req.body;
        const categories = searchService.getCategories(search.text);
        res.status(200).json(categories);
    }

    @ApiOperation({ description: 'Get list of courses that match the given search query' })
    @ApiOkResponse({
        description: 'List of the courses',
        type: Array<Course>,
    })
    @Get('/course')
    public async getCourses(req: Request, res: Response) {
        const { search } = req.body;
        const courses = searchService.getCourses(search.text);
        res.status(200).json(courses);
    }

    @ApiOperation({ description: 'Get list of chapters that match the given search query' })
    @ApiOkResponse({
        description: 'List of the chapters',
        type: Array<Chapter>,
    })
    @Get('/chapter')
    public async getChapters(req: Request, res: Response) {
        const { search } = req.body;
        const chapters = searchService.getChapters(search.text);
        res.status(200).json(chapters);
    }

}

export default new SearchController();