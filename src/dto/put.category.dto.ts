import { ApiProperty, PartialType } from "@nestjs/swagger";
import { PostCategoryDTO } from "./post.category.dto";

export class PutCategoryDTO extends PartialType(PostCategoryDTO) {}