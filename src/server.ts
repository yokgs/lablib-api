import { INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import bodyParser from 'body-parser';
import fileUpload from 'express-fileupload';
import methodOverride from 'method-override';
import cookieSession from 'cookie-session';
import express, { Application } from 'express';
import morgan from 'morgan';
import { AppModule } from './app.module';
import { config } from './config/env.config';
import { securityMiddleware } from './config/security.config';
import { errorHandler } from './error/errorhandler.handler';
import { NotFoundException } from './error/NotFoundException.error';
import { decodeUser } from './middleware/decodeuser.middleware';
import categoryRouter from './route/category.router';
import chapterRouter from './route/chapter.router';
import courseRouter from './route/course.router';
import imageRouter from './route/image.router';
import labRouter from './route/lab.router';
import searchRouter from './route/search.router';
import stepRouter from './route/step.router';
import userRouter from './route/user.router';
import cors from 'cors';

export class App {

    private _app: Application;
    private app: INestApplication;
    private _origins: string[] = ["http://localhost:3000", "https://admin-lablib.herokuapp.com"];

    constructor() {
        this._app = express();
        this._app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));
        this.mapMiddleware();
        this.mapRoutes();

        /**
         * Error Handler
         */
        this._app.use(errorHandler);

    }

    private mapRoutes() {

        this._app.use('/api/v1/user', userRouter.router);
        this._app.use('/api/v1/category', categoryRouter.router);
        this._app.use('/api/v1/course', courseRouter.router);
        this._app.use('/api/v1/chapter', chapterRouter.router);
        this._app.use('/api/v1/lab', labRouter.router);
        this._app.use('/api/v1/step', stepRouter.router);
        this._app.use('/api/v1/search', searchRouter.router);
        this._app.use('/api/v1/image', imageRouter.router);

        this._app.get('/', (req, res) => res.send(`Welcome to LabLib :)
        <ul>
            <li>
                <a href="/api/v1/category">start from here</a>
            </li>
            <li>
                <a href="/docs">read the documentation</a>
            </li>
        </ul>`));
        this._app.put('/', function (req, res) {
            console.log(req.files);
        })
    }
    private mapMiddleware() {
        this._app.use(fileUpload({
            createParentPath: true
        }));
        this._app.use(methodOverride(function (req, res) {
            if (req.body && typeof req.body === 'object' && '_method' in req.body) {
                // look in urlencoded POST bodies and delete it
                var method = req.body._method
                delete req.body._method
                return method
            }
        }))
        this._app.use(config.NODE_ENV !== "production" ? morgan('dev') : morgan('combined'));
        this._app.use(securityMiddleware);
        this._app.use(
            cors({
                origin: (origin, callback) => {
                    console.log(origin);
                    if (true /*origin && this._origins.indexOf(origin) !== -1*/) {
                        callback(null, true);
                    } else {
                        callback(new Error('Not allowed by CORS'));
                    }
                },
                credentials: true
            }));
        this._app.use(
            cookieSession({
                name: 'access_token',
                domain: config.COOKIE_DOMAIN,
                signed: false,
                httpOnly: true,
                secure: config.NODE_ENV === 'production',
                sameSite: "none"
            })
        );
        this._app.use(
            decodeUser
        );
        this._app.use(
            express.json({
                limit: '10mb',
            })
        );

        /**
         * Add your middlewares here
         */
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
