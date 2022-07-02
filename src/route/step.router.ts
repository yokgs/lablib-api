import { Router } from "express";
import stepController from "../controller/step.controller";

class StepRouter {
    public router: Router;

    constructor() {
        this.router = Router();
        this.routes();
    }

    private routes() {
        this.router.get('/',stepController.allSteps);
        this.router.post('/', stepController.createStep);
        this.router.get('/:stepId', stepController.stepById);
        this.router.put('/:stepId', stepController.updateStep);
        this.router.delete('/:stepId',  stepController.deleteStep);
    }

}

export default new StepRouter();