import jwt from 'jsonwebtoken';
import config from '../config/config';

export const generateToken = (userId: number, expiresMinutes: number, secret = config.jwt.secret): string => {
    const payload = {
        sub: userId,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (expiresMinutes * 60),
    };
    return jwt.sign(payload, secret);
};

export const generateAuthTokens = async (userId: number) => {
    const accessToken = generateToken(userId, config.jwt.accessExpirationMinutes);
    return {
        access: {
            token: accessToken,
            expires: new Date(Date.now() + config.jwt.accessExpirationMinutes * 60 * 1000),
        },
    };
};
