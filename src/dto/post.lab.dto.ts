import { ApiProperty } from "@nestjs/swagger";

export class PostLabDTO {
    @ApiProperty({
        required: true
    })
    name: string;

    @ApiProperty({
        default: 1800
    })
    duration: number;

    @ApiProperty({
        default: 'easy'
    })
    level: string;

    @ApiProperty({
        required: true
    })
    chapter: number;


}