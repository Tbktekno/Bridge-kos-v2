import { str } from '../../../utils/http.js';
import type { RequestHandler } from 'express';
import { asyncHandler } from '../../../core/async-handler.js';
import { sendSuccess } from '../../../common/response.js';
import { HttpStatus } from '../../../common/http-status.js';
import * as reviewService from '../service/review.service.js';
import type { CreateReplyBody, CreateReviewBody } from '../validator/review.validator.js';

export const create: RequestHandler = asyncHandler(async (req, res) => {
  const body = req.body as CreateReviewBody;
  const review = await reviewService.create(req.user!.id, body);
  sendSuccess(res, review, { message: 'Review submitted' }, HttpStatus.CREATED);
});

export const listByHouse: RequestHandler = asyncHandler(async (req, res) => {
  const result = await reviewService.listByHouse(str(req.params.boardingHouseId), req.query);
  sendSuccess(res, result.items, { message: 'Reviews retrieved', meta: result.meta });
});

export const listMine: RequestHandler = asyncHandler(async (req, res) => {
  const reviews = await reviewService.listMine(req.user!.id);
  sendSuccess(res, reviews, { message: 'Reviews retrieved' });
});

export const reply: RequestHandler = asyncHandler(async (req, res) => {
  const body = req.body as CreateReplyBody;
  const reply = await reviewService.reply(req.user!.id, str(req.params.id), body);
  sendSuccess(res, reply, { message: 'Reply posted' }, HttpStatus.CREATED);
});
