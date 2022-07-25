import { ApiProperty } from "@nestjs/swagger";

export class PostUserDTO {
    @ApiProperty({
        required: true
    })
    firstname: string;

    @ApiProperty({
        required: true
    })
    lastname: string;

    @ApiProperty({
        required: true
    })
    email: string;

    @ApiProperty({
        required: true
    })
    password: string;
}