import { Request, Response, NextFunction } from 'express';
import { status as httpStatus } from 'http-status';
import config from '../config/config';
import logger from '../config/logger';
import ApiError from '../utils/ApiError';

const errorConverter = (err: any, req: Request, res: Response, next: NextFunction) => {
    let error = err;
    if (!(error instanceof ApiError)) {
        const statusCode =
            error.statusCode || error instanceof Error ? httpStatus.BAD_REQUEST : httpStatus.INTERNAL_SERVER_ERROR;
        const message = error.message || httpStatus[statusCode as keyof typeof httpStatus] || httpStatus.INTERNAL_SERVER_ERROR;
        error = new ApiError(statusCode, message as string, undefined, false, err.stack);
    }
    next(error);
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const errorHandler = (err: ApiError, req: Request, res: Response, next: NextFunction) => {
    let { statusCode, message } = err;
    if (config.env === 'production' && !err.isOperational) {
        statusCode = httpStatus.INTERNAL_SERVER_ERROR;
        message = httpStatus[httpStatus.INTERNAL_SERVER_ERROR] as string;
    }

    res.locals.errorMessage = err.message;

    const response = {
        status: statusCode >= 400 && statusCode < 500 ? 'fail' : 'error',
        message,
        ...(err.errors && { errors: err.errors }),
        ...(config.env === 'development' && { stack: err.stack }),
    };

    if (config.env === 'development') {
        logger.error(err);
    }

    res.status(statusCode).send(response);
};

export {
    errorConverter,
    errorHandler,
};
