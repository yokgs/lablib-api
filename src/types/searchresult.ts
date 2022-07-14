import { ApiProperty } from "@nestjs/swagger";
import { Category } from "../model/category";
import { Chapter } from "../model/chapter";
import { Course } from "../model/course";

export class SearchResult {
    @ApiProperty()
    input: string;
    @ApiProperty({ type: 'array', items: new Category })
    categories: Category[];
    @ApiProperty({ type: 'array', items: new Course })
    courses: Course[];
    @ApiProperty()
    chapters: Chapter[];
}
