import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const envSchema = z.object({
    NODE_ENV: z.enum(['production', 'development', 'test']).default('development'),
    PORT: z.coerce.number().default(3000),
});

const envVars = envSchema.parse(process.env);

export default {
    env: envVars.NODE_ENV,
    port: envVars.PORT,
};
