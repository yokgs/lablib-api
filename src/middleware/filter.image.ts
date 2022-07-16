import { Request, Response, NextFunction } from 'express';
import { UnauthorizedError } from '../error/UnauthorizedError.error';

export const filterImage = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (!req.files || !req.files.image ||(req.files && req.files.image && /image\/[\w]+/.test(req.files.image['mimetype']))) {
        return next();
    }

    throw new UnauthorizedError('Unauthorized file');
};
