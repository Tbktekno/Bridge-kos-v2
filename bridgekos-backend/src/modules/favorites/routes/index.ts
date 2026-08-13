import { Router } from 'express';
import { Role } from '../../../generated/prisma/client.js';
import { authenticate } from '../../auth/middleware/authenticate.js';
import { authorize } from '../../auth/middleware/authorize.js';
import { add, list, remove } from '../controller/favorite.controller.js';

export const favoriteRouter: Router = Router();

favoriteRouter.use(authenticate, authorize(Role.TENANT));

favoriteRouter.get('/me', list);
favoriteRouter.post('/:boardingHouseId', add);
favoriteRouter.delete('/:boardingHouseId', remove);
