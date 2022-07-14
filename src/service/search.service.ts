import categoryService from './category.service'
import courseService from './course.service'
import chapterService from './chapter.service'
import { Injectable } from '@nestjs/common';
import { Category } from '../model/category';
import { Course } from '../model/course';
import { Chapter } from '../model/chapter';

@Injectable()
export class SearchService {

    private matcher(query: string): RegExp {
        const input2matcher = '[\\w\\W]*' + query.replace(/[\W]+/g, '').split('').map(x => x + '[\\w\\W]*').join('');
        return new RegExp(input2matcher, 'gi');
    }
    public async getCategories(query: string): Promise<Category[]> {
        let searchRegExp = this.matcher(query);
        let allCategories = await categoryService.getAll();
        return allCategories.filter(x => searchRegExp.test(x.name) || searchRegExp.test(x.description));
    }

    public async getCourses(query: string): Promise<Course[]> {
        let searchRegExp = this.matcher(query);
        let allCourses = await courseService.getAll();
        return allCourses.filter(x => searchRegExp.test(x.name) || searchRegExp.test(x.description));
    }

    public async getChapters(query: string): Promise<Chapter[]> {
        let searchRegExp = this.matcher(query);
        let allChapters = await chapterService.getAll();
        return allChapters.filter(x => searchRegExp.test(x.name));
    }


}
export default new SearchService();