import { ApiProperty } from "@nestjs/swagger";

export class PostLabDTO {
    @ApiProperty({
        required: true
    })
    name: string;

    @ApiProperty({
        required: false
    })
    description: string;

    @ApiProperty({
        default: 1800
    })
    duration: number;

    @ApiProperty({
        default: 1
    })
    level: number;

    @ApiProperty({
        required: true
    })
    chapter: number;


}