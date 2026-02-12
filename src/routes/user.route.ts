import express from 'express';
import auth from '../middlewares/auth.middleware';
import { userController } from '../controllers';
import { permissions as p } from '../config/rbac.config';

const router = express.Router();

router.get('/profile', auth(p.user.read), userController.getProfile);

router.get('/list', auth(p.user.read), userController.getUsers);

router.get('/admin-only', auth(p.role.read), userController.getAdminContent);

export default router;
