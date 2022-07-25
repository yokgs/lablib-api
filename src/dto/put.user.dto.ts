import { PartialType } from "@nestjs/swagger";
import { PostUserDTO } from "./post.user.dto";

export class PutUserDTO extends PartialType(PostUserDTO) {}