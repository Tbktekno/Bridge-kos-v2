import { str } from '../../../utils/http.js';
import type { RequestHandler } from 'express';
import { asyncHandler } from '../../../core/async-handler.js';
import { sendSuccess } from '../../../common/response.js';
import { HttpStatus } from '../../../common/http-status.js';
import * as bookingService from '../service/booking.service.js';
import type { CreateBookingBody } from '../validator/booking.validator.js';

export const create: RequestHandler = asyncHandler(async (req, res) => {
  const body = req.body as CreateBookingBody;
  const booking = await bookingService.create(req.user!.id, body);
  sendSuccess(res, booking, { message: 'Booking created' }, HttpStatus.CREATED);
});

export const listMine: RequestHandler = asyncHandler(async (req, res) => {
  const result = await bookingService.listMine(req.user!.id, req.query);
  sendSuccess(res, result.items, { message: 'Bookings retrieved', meta: result.meta });
});

export const listByOwner: RequestHandler = asyncHandler(async (req, res) => {
  const result = await bookingService.listByOwner(req.user!.id, req.query);
  sendSuccess(res, result.items, { message: 'Bookings retrieved', meta: result.meta });
});

export const detail: RequestHandler = asyncHandler(async (req, res) => {
  const booking = await bookingService.getById(req.user!.id, str(req.params.id));
  sendSuccess(res, booking, { message: 'Booking retrieved' });
});

export const cancel: RequestHandler = asyncHandler(async (req, res) => {
  const booking = await bookingService.cancelByTenant(req.user!.id, str(req.params.id));
  sendSuccess(res, booking, { message: 'Booking cancelled' });
});

export const confirm: RequestHandler = asyncHandler(async (req, res) => {
  const booking = await bookingService.confirmByOwner(req.user!.id, str(req.params.id));
  sendSuccess(res, booking, { message: 'Booking confirmed' });
});

export const reject: RequestHandler = asyncHandler(async (req, res) => {
  const booking = await bookingService.rejectByOwner(req.user!.id, str(req.params.id));
  sendSuccess(res, booking, { message: 'Booking rejected' });
});

export const complete: RequestHandler = asyncHandler(async (req, res) => {
  const booking = await bookingService.completeByOwner(req.user!.id, str(req.params.id));
  sendSuccess(res, booking, { message: 'Booking completed' });
});
