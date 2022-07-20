import { Request, Response } from 'express';
import moment from 'moment';
import { BadRequestException } from '../error/BadRequestException.error';
import { Lab } from '../model/lab';
import chapterService, { ChapterService } from '../service/chapter.service';
import labService from '../service/lab.service';
import { Controller, Get, Post, Body, Delete, Put } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PostLabDTO } from '../dto/post.lab.dto';
import { NotFoundException } from '../error/NotFoundException.error';
import stepService from '../service/step.service';
import { PutLabDTO } from '../dto/put.lab.dto';

@ApiTags('Lab')
@Controller('api/v1/lab')
export class LabController {

    @ApiOperation({ description: 'Get a list of labs' })
    @Get('/')
    public async getLabs(req: Request, res: Response) {
        res.status(200).json((await labService.getAll()).map((lab) => ({ ...lab, chapter: lab.chapter.name, steps: lab.steps.length })));
    }

    @ApiOperation({ description: 'Create a new lab' })
    @ApiBody({
        type: PostLabDTO,
        description: 'infos about the new lab'
    })
    @Post('/')
    public async createLab(req: Request, res: Response) {
        const { name, duration, chapter } = req.body;

        if (!name) {
            throw new BadRequestException('Missing required fields');
        }

        if (await labService.getByName(name)) {
            throw new BadRequestException('Lab under this name already exists');
        }
        let $chapter = await chapterService.getById(Number(chapter));
        if (!$chapter) {
            throw new NotFoundException('Cannot find chapter ' + chapter);
        }
        const lab = new Lab();

        lab.name = name;
        lab.duration = duration;
        lab.chapter = $chapter;
        const newLab = await labService.create(lab);

        res.status(201).json({ ...newLab, chapter: lab.chapter.name });
    }

    @ApiOperation({ description: 'Get details of a lab' })
    @ApiResponse({
        status: 404,
        description: 'Lab not found',
    })
    @Get('/:labId')
    public async labById(req: Request, res: Response) {
        const labId = Number(req.params.labId);
        const lab = await labService.getById(Number(labId));

        if (!lab) {
            throw new NotFoundException('Lab not found');
        }
        res.status(200).json({ ...lab });
    }

    @ApiOperation({ description: 'Modify a lab' })
    @ApiBody({
        type: PutLabDTO,
        description: 'infos to be updated',
    })
    @ApiResponse({
        status: 404,
        description: 'Lab not found',
    })
    @Put('/:labId')
    public async updateLab(req: Request, res: Response) {
        const { name, duration, image } = req.body;

        const { labId } = req.params;
        const lab = await labService.getById(Number(labId));

        if (!lab) {
            throw new NotFoundException('Lab not found');
        }
        lab.name = name || lab.name;
        lab.duration = duration || lab.duration;

        const updatedLab = await labService.update(Number(labId), lab);
        return res.status(200).json({ ...updatedLab });
    }

    @ApiOperation({ description: 'Delete a lab from the database.' })
    @ApiResponse({
        status: 404,
        description: 'Lab not found',
    })
    @Delete('/:labId')
    public async deleteLab(req: Request, res: Response) {
        const { labId } = req.params;

        const lab = await labService.getById(Number(labId));

        if (!lab) {
            throw new NotFoundException('Lab not found');
        }

        await labService.delete(lab.id);

        return res.status(200).json({});
    }

    @ApiOperation({ description: 'Get a list of steps for a given lab' })
    @ApiResponse({
        status: 404,
        description: 'Lab not found',
    })
    @Get('/:labId/list')
    public async getStepsByLab(req: Request, res: Response) {
        const { labId } = req.params;
        const lab = await labService.getById(Number(labId));

        if (!lab)
            throw new NotFoundException('Lab not found');

        let steps = await stepService.getByLab(Number(labId));
        res.status(200).json(steps);
    }
}

export default new LabController();
