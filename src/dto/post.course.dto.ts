import { ApiProperty } from "@nestjs/swagger";

export class PostCourseDTO{
    @ApiProperty({
        required: true
    })
    name: string;

    @ApiProperty({
        required: false
    })
    image: string;

    @ApiProperty({
        default: '',
        maxLength: 255,
        required: false
    })
    description: string;

    @ApiProperty({
        required: true
    })
    category: number;

}