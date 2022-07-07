import { PartialType } from "@nestjs/swagger";
import { PostCourseDTO } from "./post.course.dto";

export class PutCourseDTO extends PartialType(PostCourseDTO) {}