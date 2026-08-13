import { str } from '../../../utils/http.js';
import type { RequestHandler } from 'express';
import { asyncHandler } from '../../../core/async-handler.js';
import { sendSuccess } from '../../../common/response.js';
import * as paymentService from '../service/payment.service.js';
import type { UploadReceiptBody } from '../validator/payment.validator.js';

export const listMine: RequestHandler = asyncHandler(async (req, res) => {
  const result = await paymentService.listMine(req.user!.id, req.query);
  sendSuccess(res, result.items, { message: 'Payments retrieved', meta: result.meta });
});

export const listByOwner: RequestHandler = asyncHandler(async (req, res) => {
  const result = await paymentService.listByOwner(req.user!.id, req.query);
  sendSuccess(res, result.items, { message: 'Payments retrieved', meta: result.meta });
});

export const detail: RequestHandler = asyncHandler(async (req, res) => {
  const payment = await paymentService.getById(req.user!.id, str(req.params.id));
  sendSuccess(res, payment, { message: 'Payment retrieved' });
});

export const detailByBooking: RequestHandler = asyncHandler(async (req, res) => {
  const payment = await paymentService.getByBooking(req.user!.id, str(req.params.bookingId));
  sendSuccess(res, payment, { message: 'Payment retrieved' });
});

export const uploadReceipt: RequestHandler = asyncHandler(async (req, res) => {
  const body = req.body as UploadReceiptBody;
  const payment = await paymentService.uploadReceipt(
    req.user!.id,
    str(req.params.id),
    body.receiptUrl,
  );
  sendSuccess(res, payment, { message: 'Receipt uploaded' });
});

export const confirmPaid: RequestHandler = asyncHandler(async (req, res) => {
  const payment = await paymentService.confirmPaid(req.user!.id, str(req.params.id));
  sendSuccess(res, payment, { message: 'Payment confirmed' });
});

export const refund: RequestHandler = asyncHandler(async (req, res) => {
  const payment = await paymentService.refund(req.user!.id, str(req.params.id));
  sendSuccess(res, payment, { message: 'Payment refunded' });
});
