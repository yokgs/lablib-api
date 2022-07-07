import { PartialType } from "@nestjs/swagger";
import { PostChapterDTO } from "./post.chapter.dto";

export class PutChapterDTO extends PartialType(PostChapterDTO) {}