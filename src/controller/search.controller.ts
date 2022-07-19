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

    @ApiOperation({ description: 'Get list of entities that match the given search body' })
    @ApiOkResponse({
        description: 'List of the selected entities',
        type: SearchResult,
    })
    @Post('/')
    public async getResults(req: Request, res: Response) {
        const { search } = req.body;

        const categories = searchService.getCategories(search.text);
        const courses = searchService.getCourses(search.text);
        const chapters = searchService.getChapters(search.text);

        res.status(200).json({ categories, courses, chapters, input: search.text });
    }
    @ApiOperation({ description: 'Get list of entities that match the given search query' })
    @ApiOkResponse({
        description: 'List of the selected entities',
        type: SearchResult,
    })
    @Get('/')
    public async getResultsQ(req: Request, res: Response) {
        let { q } = req.query;
        let search = q.toString();
        const categories = await searchService.getCategories(search);
        const courses = await searchService.getCourses(search);
        const chapters = await searchService.getChapters(search);
        res.status(200).json({ categories, courses, chapters, input: search });
    }


    @ApiOperation({ description: 'Get list of categories that match the given search query' })
    @ApiOkResponse({
        description: 'List of the categories',
        type: Array<Category>,
    })
    @Post('/category')
    public async getCategories(req: Request, res: Response) {
        const { search } = req.body;
        const categories =await searchService.getCategories(search.text);
        res.status(200).json(categories);
    }

    @ApiOperation({ description: 'Get list of courses that match the given search query' })
    @ApiOkResponse({
        description: 'List of the courses',
        type: Array<Course>,
    })
    @Post('/course')
    public async getCourses(req: Request, res: Response) {
        const { search } = req.body;
        const courses = await searchService.getCourses(search.text);
        res.status(200).json(courses);
    }

    @ApiOperation({ description: 'Get list of chapters that match the given search query' })
    @ApiOkResponse({
        description: 'List of the chapters',
        type: Array<Chapter>,
    })
    @Post('/chapter')
    public async getChapters(req: Request, res: Response) {
        const { search } = req.body;
        const chapters = await searchService.getChapters(search.text);
        res.status(200).json(chapters);
    }


    @ApiOperation({ description: 'Get list of categories that match the given search query' })
    @ApiOkResponse({
        description: 'List of the categories',
        type: Array<Category>,
    })
    @Get('/category')
    public async getCategoriesQ(req: Request, res: Response) {
        const { q } = req.query;
        const categories = await searchService.getCategories(q.toString());
        res.status(200).json(categories);
    }

    @ApiOperation({ description: 'Get list of courses that match the given search query' })
    @ApiOkResponse({
        description: 'List of the courses',
        type: Array<Course>,
    })
    @Get('/course')
    public async getCoursesQ(req: Request, res: Response) {
        const { q } = req.query;
        const courses = await searchService.getCourses(q.toString());
        res.status(200).json(courses);
    }

    @ApiOperation({ description: 'Get list of chapters that match the given search query' })
    @ApiOkResponse({
        description: 'List of the chapters',
        type: Array<Chapter>,
    })
    @Get('/chapter')
    public async getChaptersQ(req: Request, res: Response) {
        const { q } = req.query;
        const chapters = await searchService.getChapters(q.toString());
        res.status(200).json(chapters);
    }
}

export default new SearchController();