import { Request, Response } from 'express';
import { BadRequestException } from '../error/BadRequestException.error';
import { Category } from '../model/category';
import categoryService from '../service/category.service';
import courseService from '../service/course.service';
import { Controller, Get, Post, Body, Delete, Put } from '@nestjs/common';
import { ApiBadRequestResponse, ApiBody, ApiOkResponse, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { NotFoundException } from '../error/NotFoundException.error';
import { SearchResult } from '../types/searchresult'
@ApiTags('Category', 'Course', 'Chapter', 'Lab', 'Step')
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
        const input2matcher = '[\\w\\W]*' + search.text.replace(/[\W]+/g, '').replaceAll('', '[\\w\\W]*');
        let searchRegExp = new RegExp(input2matcher, 'gi');
        let allCategories = await categoryService.getAll();
        let allCourses = await courseService.getAll();
        const categories = allCategories.filter(x => searchRegExp.test(x.name) || searchRegExp.test(x.description));
        const courses = allCourses.filter(x => searchRegExp.test(x.name) || searchRegExp.test(x.description));

        res.status(200).json({ categories, courses, input: search.text });
    }

}

export default new SearchController();