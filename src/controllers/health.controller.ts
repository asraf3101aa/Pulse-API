import { Request, Response } from 'express';
import catchAsync from '../utils/catchAsync';
import ApiResponse from '../utils/ApiResponse';

const healthCheck = catchAsync(async (req: Request, res: Response) => {
    ApiResponse.success(res, { uptime: process.uptime() }, 'Server is up and running');
});

export default {
    healthCheck,
};
