import { Category } from "../model/category";
import { Course } from "../model/course";

export class SearchResult {
    input: string;
    categories: Category[];
    courses: Course[];
}
