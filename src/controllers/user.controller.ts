import { Request, Response } from 'express';
import catchAsync from '../utils/catchAsync';
import * as userService from '../services/user.service';
import ApiResponse from '../utils/ApiResponse';

export const getProfile = catchAsync(async (req: Request, res: Response) => {
    ApiResponse.success(res, req.user, 'User profile fetched successfully');
});

export const getUsers = catchAsync(async (_req: Request, res: Response) => {
    const users = await userService.getUsers();
    ApiResponse.success(res, users, 'User list fetched successfully');
});

export const getAdminContent = catchAsync(async (_req: Request, res: Response) => {
    ApiResponse.success(res, { content: 'This is premium admin content' }, 'Admin access granted');
});
