import { Request, Response } from 'express';
import moment from 'moment';
import { BadRequestException } from '../error/BadRequestException.error';
import { Step } from '../model/step';
import stepService from '../service/step.service';
import labService from '../service/lab.service';
import { Controller, Get, Post, Body, Delete, Put, Param } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { NotFoundException } from '../error/NotFoundException.error';
import { PostStepDTO } from '../dto/post.step.dto';
import { PutStepDTO } from '../dto/put.step.dto';
import { number } from 'joi';

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
        const { name, lab, content, demo, rang, duration } = req.body;

        if (!lab || !name || !content) {
            throw new BadRequestException('Missing required fields');
        }

        let $lab = await labService.getById(Number(lab));
        if (!$lab) {
            throw new BadRequestException('Cannot find lab ' + lab);
        }
        const step = new Step();

        step.name = name;
        step.rang = rang || (Math.max(...$lab.steps.map(x => x.rang), 0) + 1);
        step.demo = demo;
        step.content = content;
        step.lab = $lab;
        step.duration = Number(duration);
        const newStep = await stepService.create(step);

        res.status(200).json({ ...newStep, lab: step.lab.name });
    }

    @ApiOperation({ description: 'Get details of a step' })
    @ApiResponse({
        status: 404,
        description: 'Step not found',
    })
    @Get('/:stepId')
    public async stepById(req: Request, res: Response) {
        const stepId = Number(req.params.stepId);
        const step = await stepService.getById(stepId);

        if (!step) {
            throw new NotFoundException('Step not found');
        }
        
        res.status(200).json({ ...step, lab: step.lab.id });
    }

    @ApiOperation({ description: 'Modify a step' })
    @ApiParam({ name: 'stepId', type: number })
    @ApiBody({
        type: PutStepDTO,
        description: 'infos to be updated',
    })
    @ApiResponse({
        status: 404,
        description: 'Step not found',
    })
    @Put('/:stepId')
    public async updateStep(@Param('stepId') req: Request, res: Response) {
        const { name, lab, rang, demo, content, duration } = req.body;

        const { stepId } = req.params;

        const step = await stepService.getById(Number(stepId));

        if (!step) {
            throw new NotFoundException('Step not found');
        }

        name && (step.name = name);
        content && (step.content = content);
        demo && (step.demo = demo);
        rang && (step.rang = Number(rang));
        duration && (step.duration = Number(duration));
        if (typeof lab != 'undefined') {
            let $lab = await labService.getById(Number(lab));
            if (!$lab) {
                throw new NotFoundException('Cannot find lab ' + lab);
            }
            step.lab = $lab;
        }

        const updatedStep = await stepService.update(Number(stepId), step);

        return res.status(200).json({ ...updatedStep, lab: updatedStep.lab?.id });
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

        await stepService.delete(step.id);

        return res.status(200).json({});
    }
}

export default new StepController();

