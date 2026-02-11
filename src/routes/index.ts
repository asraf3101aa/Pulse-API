import express from 'express';

const router = express.Router();

const defaultRoutes = [
    {
        path: '/health',
        route: healthRoute,
    },
];

defaultRoutes.forEach((route) => {
    router.use(route.path, route.route);
});

export default router;
