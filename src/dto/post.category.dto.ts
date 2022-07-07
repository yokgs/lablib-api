import { ApiProperty } from "@nestjs/swagger";

export class PostCategoryDTO {
    @ApiProperty({
        required: true
    })
    name: string;

    @ApiProperty({
        maxLength: 255,
        required: false
    })
    description: string;

    @ApiProperty({
        required: false
    })
    image: string;
}