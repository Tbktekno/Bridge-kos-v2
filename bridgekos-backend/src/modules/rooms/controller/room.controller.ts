import { str } from '../../../utils/http.js';
import type { RequestHandler } from 'express';
import { asyncHandler } from '../../../core/async-handler.js';
import { sendSuccess } from '../../../common/response.js';
import { HttpStatus } from '../../../common/http-status.js';
import * as roomService from '../service/room.service.js';
import type { CreateRoomBody, UpdateRoomBody } from '../validator/room.validator.js';

export const listByHouse: RequestHandler = asyncHandler(async (req, res) => {
  const result = await roomService.listByHouse(str(req.query.boardingHouseId), req.query);
  sendSuccess(res, result.items, { message: 'Rooms retrieved', meta: result.meta });
});

export const listForHouseParam: RequestHandler = asyncHandler(async (req, res) => {
  const result = await roomService.listByHouse(str(req.params.boardingHouseId), req.query);
  sendSuccess(res, result.items, { message: 'Rooms retrieved', meta: result.meta });
});

export const detail: RequestHandler = asyncHandler(async (req, res) => {
  const room = await roomService.getById(str(req.params.id));
  sendSuccess(res, room, { message: 'Room retrieved' });
});

export const createRoom: RequestHandler = asyncHandler(async (req, res) => {
  const body = req.body as CreateRoomBody;
  const room = await roomService.create(req.user!.id, body);
  sendSuccess(res, room, { message: 'Room created' }, HttpStatus.CREATED);
});

export const updateRoom: RequestHandler = asyncHandler(async (req, res) => {
  const body = req.body as UpdateRoomBody;
  const room = await roomService.update(req.user!.id, str(req.params.id), body);
  sendSuccess(res, room, { message: 'Room updated' });
});

export const remove: RequestHandler = asyncHandler(async (req, res) => {
  await roomService.remove(req.user!.id, str(req.params.id));
  sendSuccess(res, null, { message: 'Room deleted' });
});
