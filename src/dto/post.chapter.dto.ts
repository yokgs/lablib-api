import { ApiProperty } from "@nestjs/swagger";

export class PostChapterDTO {
    @ApiProperty({
        required: true
    })
    name: string;

    @ApiProperty({
        required: true
    })
    course: string;

    @ApiProperty({
        required: false
    })
    ordre: number;
}