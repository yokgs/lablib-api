import { Request, Response } from 'express';
import moment from 'moment';
import { BadRequestException } from '../error/BadRequestException.error';
import { Step } from '../model/step';
import stepService from '../service/step.service';
import labService from '../service/lab.service';

class StepController {
    public async currentStep(req: Request, res: Response) {
        let stepName = req.params.step.replace(/\-/g, ' ');
        res.status(200).json({ ...await stepService.getByName(stepName) });
    }

    public async allSteps(req: Request, res: Response) {
        res.status(200).json((await stepService.getAll()).map((step) => ({ ...step, lab: step.lab.name })));
    }

    public async createStep(req: Request, res: Response) {
        const { name, lab, description, image } = req.body;

        if (!description || !lab || !name) {
            throw new BadRequestException('Missing required fields');
        }

        if (await stepService.getByName(name)) {
            throw new BadRequestException('Step under this name already exists');
        }

        const step = new Step();

        step.name = name;
        step.lab = await labService.getByName(lab);
        const newStep = await stepService.create(step);

        res.status(200).json({ ...newStep, lab: step.lab.name });
    }

    public async stepById(req: Request, res: Response) {
        const stepId = Number(req.params.id);

        res.status(200).json({ ...await stepService.getById(stepId) });
    }

    public async updateStep(req: Request, res: Response) {
        const { name, lab, description, image } = req.body;

        const { stepId } = req.params;
        const step = await stepService.getById(Number(stepId));

        if (!step) {
            throw new BadRequestException('Step not found');
        }

        if (!name || !lab || !description || !image) {
            throw new BadRequestException('Missing required fields');
        }

        step.name = name;


        const updatedStep = await stepService.update(Number(stepId), step);

        return res.status(200).json({ ...updatedStep });
    }
    public async deleteStep(req: Request, res: Response) {
        const { stepId } = req.params;

        const step = await stepService.getById(Number(stepId));

        if (!step) {
            throw new BadRequestException('Step not found');
        }

        await stepService.delete(Number(step));

        return res.status(200).json({});
    }
}

export default new StepController();