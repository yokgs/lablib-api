import express, { Application } from 'express';
import { config } from './config/env.config';
import { NotFoundException } from './error/NotFoundException.error';
import categoryRouter from './route/category.router';
import chapterRouter from './route/chapter.router';
import courseRouter from './route/course.router';

export class App {
    private _app: Application;

    constructor() {
        this._app = express();
        this.mapRoutes();

        /**
         * Not Found Handler
         */

        this._app.use(this.notFound);

        /**
         * Error Handler
         */
    }

    private mapRoutes() {

        /**
         * Add your routes here
         */
        
        this._app.use('/api/category', categoryRouter.router);
        this._app.use('/api/course', courseRouter.router);
        this._app.use('/api/chapter', chapterRouter.router);
        this._app.get('/', (req, res) => res.send('welcome to lablib :) <a href="/api/course">start from here</a>'));
    }

    private notFound(
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) {
        next(new NotFoundException());
    }

    public listen(callback: () => void) {
        return this._app.listen(config.port, callback);
    }
}
