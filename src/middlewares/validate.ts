import { Request, Response, NextFunction } from 'express';
import { status as httpStatus } from 'http-status';
import { ZodType, ZodError } from 'zod';
import ApiError from '../utils/ApiError';

const validate = (schema: ZodType<any>) => async (req: Request, res: Response, next: NextFunction) => {
    try {
        const validData = await schema.parseAsync({
            body: req.body,
            query: req.query,
            params: req.params,
        });

        // Assign validated data back to req to ensure type safety and cleaned data
        Object.assign(req, validData);

        return next();
    } catch (error) {
        if (error instanceof ZodError) {
            const formattedErrors: Record<string, string[]> = {};

            (error as any).errors.forEach((e: any) => {
                const key = e.path.join('.') || 'root';
                if (!formattedErrors[key]) {
                    formattedErrors[key] = [];
                }
                formattedErrors[key].push(e.message);
            });

            return next(new ApiError(httpStatus.BAD_REQUEST, 'Validation Error', formattedErrors));
        }
        return next(error);
    }
};

export default validate;
