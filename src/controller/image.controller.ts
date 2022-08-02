import { Request, Response } from 'express';
import { Controller, Get, Post, Body, Delete, Put } from '@nestjs/common';
import { ApiBadRequestResponse, ApiBody, ApiOkResponse, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { NotFoundException } from '../error/NotFoundException.error';
import imageService from '../service/image.service';
import sharp from 'sharp';
import { ImageEntity } from '../model/image';
@ApiTags('Image')
@Controller('api/v1/image')
export class ImageController {

    @ApiOperation({ description: 'Get the requested image.' })
    @ApiOkResponse({
        description: 'image file',
        type: String,
    })
    @Get('/:uuid')
    public async getImage(req: Request, res: Response) {
        const { uuid } = req.params;
        let image = await imageService.getById(uuid);
        if (!image) {
            throw new NotFoundException('Image not found');
        }
        res.status(200).send(image.content);
    }

    @ApiOperation({ description: 'Get the requested image with the given dimensions' })
    @ApiOkResponse({
        description: 'image file',
        type: String,
    })
    @Get('/:uuid/:width')
    public async getAndResizeImage(req: Request, res: Response) {
        const { uuid, width } = req.params;
        let image = await imageService.getById(uuid);
        if (!image) {
            throw new NotFoundException('Image not found');
        }
        let newImage = await sharp(image.content).png().resize(Number(width)).toBuffer();
        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Content-Disposition', 'attachment; filename="' + uuid + '.png"');
        res.status(200).send(newImage);
    }

    @ApiOperation({ description: 'Set the default image' })
    @ApiOkResponse({
        description: 'image file',
        type: String,
    })
    @Post('/')
    public async setDefaultImage(req: Request, res: Response) {
        let { image } = req.files || {};
        if (!image) {
            throw new NotFoundException('missing file');
        }
        let $image = new ImageEntity();
        $image.isDefault = true;
        $image.content = image.data;
        let _image = await imageService.setDefaultImage($image);
        res.status(200).json({ ..._image, content: '--emmited--' });
    }



}

export default new ImageController();