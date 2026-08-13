import { Router } from 'express';
import { Role } from '../../../generated/prisma/client.js';
import { validate } from '../../../middleware/validate.js';
import { authenticate } from '../../auth/middleware/authenticate.js';
import { authorize } from '../../auth/middleware/authorize.js';
import {
  createRoom,
  detail,
  listByHouse,
  listForHouseParam,
  remove,
  updateRoom,
} from '../controller/room.controller.js';
import {
  createRoomSchema,
  listRoomsQuerySchema,
  updateRoomSchema,
} from '../validator/room.validator.js';

export const roomRouter: Router = Router();

roomRouter.get('/', validate({ query: listRoomsQuerySchema }), listByHouse);
roomRouter.get('/house/:boardingHouseId', listForHouseParam);
roomRouter.get('/:id', detail);

roomRouter.use(authenticate, authorize(Role.OWNER));

roomRouter.post('/', validate({ body: createRoomSchema }), createRoom);
roomRouter.patch('/:id', validate({ body: updateRoomSchema }), updateRoom);
roomRouter.delete('/:id', remove);
