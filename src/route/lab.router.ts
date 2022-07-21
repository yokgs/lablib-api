import { Router } from "express";
import labController from "../controller/lab.controller";

class LabRouter {

    public router: Router;

    constructor() {
        this.router = Router();
        this.routes();
    }

    private routes() {
        this.router.get('/', labController.getLabs);
        this.router.post('/', labController.createLab);
        this.router.get('/:labId', labController.labById);
        this.router.put('/:labId', labController.updateLab);
        this.router.delete('/:labId', labController.deleteLab);
        this.router.get('/:labId/list',labController.getStepsByLab);
        this.router.get('/:labId/list/id',labController.getIdStepsByLab);
    }

}

export default new LabRouter();