import { PartialType } from "@nestjs/swagger";
import { PostLabDTO } from "./post.lab.dto";

export class PutLabDTO extends PartialType(PostLabDTO) {}