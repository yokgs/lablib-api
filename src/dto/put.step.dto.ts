import { PartialType } from "@nestjs/swagger";
import { PostStepDTO } from "./post.step.dto";

export class PutStepDTO extends PartialType(PostStepDTO) {}