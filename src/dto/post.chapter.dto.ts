import { ApiProperty } from "@nestjs/swagger";
import { MultipartUpload } from "aws-sdk/clients/s3";

export class PostChapterDTO {
    @ApiProperty({
        required: true
    })
    name: string;

    @ApiProperty({
        required: true
    })
    course: number;

    @ApiProperty({
        required: false
    })
    ordre: number;

    @ApiProperty({
        required: false
    })
    image: string;
}