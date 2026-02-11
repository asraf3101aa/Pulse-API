import { Response } from 'express';
import { status as httpStatus } from 'http-status';

class ApiResponse {
    static success(res: Response, data: any, message: string = '', statusCode: number = httpStatus.OK) {
        res.status(statusCode).send({
            status: 'success',
            message,
            data,
        });
    }

    static created(res: Response, data: any, message: string = '') {
        this.success(res, data, message, httpStatus.CREATED);
    }
}

export default ApiResponse;
