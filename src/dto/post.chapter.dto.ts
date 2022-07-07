import { ApiProperty } from "@nestjs/swagger";

export class PostCategoryDTO{
    @ApiProperty({
        required: true
    })
    name: string;

    @ApiProperty({
        default: '',
        maxLength: 255,
        required: false
    })
    description: string;
}