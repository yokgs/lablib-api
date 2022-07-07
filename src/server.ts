import { INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import bodyParser from 'body-parser';
import express, { Application } from 'express';
import { AppModule } from './app.module';
import { config } from './config/env.config';
import { errorHandler } from './error/errorhandler.handler';
import { NotFoundException } from './error/NotFoundException.error';
import categoryRouter from './route/category.router';
import chapterRouter from './route/chapter.router';
import courseRouter from './route/course.router';
import labRouter from './route/lab.router';
import stepRouter from './route/step.router';

export class App {

    private _app: Application;
    private app: INestApplication;

    constructor() {

        this._app = express();
        this._app.use(bodyParser.urlencoded({ extended: true }));
        this._app.use(express.json({
            limit: '10mb'
        }));
        this.mapRoutes();

        /**
         * Not Found Handler
         */

        

        /**
         * Error Handler
         */
        this._app.use(errorHandler);

    }

    private mapRoutes() {

        /**
         * Add your routes here
         */

        this._app.use('/api/v1/category', categoryRouter.router);
        this._app.use('/api/v1/course', courseRouter.router);
        this._app.use('/api/v1/chapter', chapterRouter.router);
        this._app.use('/api/v1/lab', labRouter.router);
        this._app.use('/api/v1/step', stepRouter.router);

        this._app.get('/', (req, res) => res.send('welcome to lablib :) <a href="/api/v1/category">start from here</a>  <a href="/docs/v1">read the documentation</a> '));
    }

    private notFound(
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) {
        next(new NotFoundException());
    }

    private async bootstrap() {
        this.app = await NestFactory.create(AppModule, new ExpressAdapter(this._app));
        const _config = new DocumentBuilder()
            .setTitle('LabLib API')
            .setDescription('Learning Platform and much more...')
            .setVersion('1.0')
            .build();

        const document = SwaggerModule.createDocument(this.app, _config);

        SwaggerModule.setup('docs', this.app, document);
        this._app.use(this.notFound);
    }

    public async listen(callback: () => void) {
        await this.bootstrap();
        return this.app.listen(config.port, callback);
    }

}
