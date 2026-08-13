import { Router } from 'express';
import { Role } from '../../../generated/prisma/client.js';
import { validate } from '../../../middleware/validate.js';
import { authenticate } from '../../auth/middleware/authenticate.js';
import { authorize } from '../../auth/middleware/authorize.js';
import {
  addImage,
  createBoardingHouse,
  detail,
  detailOwner,
  list,
  listMine,
  remove,
  removeImage,
  updateBoardingHouse,
  whatsappContact,
} from '../controller/boarding-house.controller.js';
import {
  addImageSchema,
  createBoardingHouseSchema,
  listBoardingHousesQuerySchema,
  updateBoardingHouseSchema,
} from '../validator/boarding-house.validator.js';

export const boardingHouseRouter: Router = Router();

boardingHouseRouter.get('/', validate({ query: listBoardingHousesQuerySchema }), list);
boardingHouseRouter.get('/:id', detail);
boardingHouseRouter.get('/:id/contact', whatsappContact);

// Owner-protected routes
boardingHouseRouter.use(authenticate, authorize(Role.OWNER));

boardingHouseRouter.get('/owner/me', validate({ query: listBoardingHousesQuerySchema }), listMine);
boardingHouseRouter.post('/', validate({ body: createBoardingHouseSchema }), createBoardingHouse);
boardingHouseRouter.patch(
  '/:id',
  validate({ body: updateBoardingHouseSchema }),
  updateBoardingHouse,
);
boardingHouseRouter.delete('/:id', remove);
boardingHouseRouter.post('/:id/images', validate({ body: addImageSchema }), addImage);
boardingHouseRouter.delete('/:id/images/:imageId', removeImage);
boardingHouseRouter.get('/:id/owner', detailOwner);
