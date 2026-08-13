import { str } from '../../../utils/http.js';
import type { RequestHandler } from 'express';
import { asyncHandler } from '../../../core/async-handler.js';
import { sendSuccess } from '../../../common/response.js';
import { HttpStatus } from '../../../common/http-status.js';
import * as favoriteService from '../service/favorite.service.js';

export const add: RequestHandler = asyncHandler(async (req, res) => {
  const favorite = await favoriteService.add(req.user!.id, str(req.params.boardingHouseId));
  sendSuccess(res, favorite, { message: 'Added to favorites' }, HttpStatus.CREATED);
});

export const remove: RequestHandler = asyncHandler(async (req, res) => {
  await favoriteService.remove(req.user!.id, str(req.params.boardingHouseId));
  sendSuccess(res, null, { message: 'Removed from favorites' });
});

export const list: RequestHandler = asyncHandler(async (req, res) => {
  const favorites = await favoriteService.list(req.user!.id);
  sendSuccess(res, favorites, { message: 'Favorites retrieved' });
});
