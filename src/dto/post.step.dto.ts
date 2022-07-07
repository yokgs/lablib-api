import { ApiProperty } from "@nestjs/swagger"

export class PostStepDTO {
    @ApiProperty({
        required: true
    })
    name: string
    @ApiProperty({
        required: false
    })
    demo: string
    @ApiProperty({
        required: true
    })
    content: string
    @ApiProperty({
        required: true
    })
    rang: number
}