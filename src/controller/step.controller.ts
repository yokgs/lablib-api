import { Request, Response } from 'express';
import moment from 'moment';
import { BadRequestException } from '../error/BadRequestException.error';
import { Step } from '../model/step';
import stepService from '../service/step.service';
import labService from '../service/lab.service';
import { Controller, Get, Post, Body, Delete, Put } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { NotFoundException } from '../error/NotFoundException.error';
import { PostStepDTO } from '../dto/post.step.dto';
import { PutStepDTO } from '../dto/put.step.dto';

@ApiTags('Step')
@Controller('api/v1/step')
export class StepController {

    @ApiOperation({ description: 'Get a list of steps' })
    @Get('/')
    public async getSteps(req: Request, res: Response) {
        res.status(200).json((await stepService.getAll()).map((step) => ({ ...step, lab: step.lab.name })));
    }

    @ApiOperation({ description: 'Create a new step' })
    @ApiBody({
        type: PostStepDTO,
        description: 'infos about the new step',
    })
    @Post('/')
    public async createStep(req: Request, res: Response) {
        const { name, lab, content, demo, rang } = req.body;

        if (!lab || !name || !rang || !content) {
            throw new BadRequestException('Missing required fields');
        }

        if (await stepService.getByName(name)) {
            throw new BadRequestException('Step under this name already exists');
        }

        let $lab = await labService.getByName(lab);
        if (!$lab) {
            throw new BadRequestException('Cannot find lab ' + lab);
        }
        const step = new Step();

        step.name = name;
        step.rang = rang;
        step.demo = demo;
        step.content = content;
        step.lab = await labService.getByName(lab);
        const newStep = await stepService.create(step);

        res.status(200).json({ ...newStep, lab: step.lab.name });
    }

    @ApiOperation({ description: 'Get details of a step' })
    @ApiBody({
        type: PutStepDTO,
        description: 'infos to be updated',
    })
    @ApiResponse({
        status: 404,
        description: 'Step not found',
    })
    @Get('/:stepId')
    public async stepById(req: Request, res: Response) {
        const stepId = Number(req.params.id);
        const step = await stepService.getById(stepId);

        if (!step) {
            throw new NotFoundException('Step not found');
        }
        res.status(200).json({ ...step });
    }

    @ApiOperation({ description: 'Modify a step' })
    @ApiResponse({
        status: 404,
        description: 'Step not found',
    })
    @Put('/:stepId')
    public async updateStep(req: Request, res: Response) {
        const { name, lab, description, image } = req.body;

        const { stepId } = req.params;
        const step = await stepService.getById(Number(stepId));

        if (!step) {
            throw new NotFoundException('Step not found');
        }

        if (!name || !lab || !description) {
            throw new BadRequestException('Missing required fields');
        }

        step.name = name;

        const updatedStep = await stepService.update(Number(stepId), step);

        return res.status(200).json({ ...updatedStep });
    }

    @ApiOperation({ description: 'Delete a step from the database.' })
    @ApiResponse({
        status: 404,
        description: 'Step not found',
    })
    @Delete('/:stepId')
    public async deleteStep(req: Request, res: Response) {
        const { stepId } = req.params;

        const step = await stepService.getById(Number(stepId));

        if (!step)
            throw new NotFoundException('Step not found');

        await stepService.delete(Number(step));

        return res.status(200).json({});
    }
}

export default new StepController();
