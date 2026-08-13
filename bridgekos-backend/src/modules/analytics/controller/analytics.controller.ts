import type { RequestHandler } from 'express';
import { asyncHandler } from '../../../core/async-handler.js';
import { sendSuccess } from '../../../common/response.js';
import * as analyticsService from '../service/analytics.service.js';

export const overview: RequestHandler = asyncHandler(async (req, res) => {
  const data = await analyticsService.overview(req.user!.id);
  sendSuccess(res, data, { message: 'Analytics overview retrieved' });
});

export const revenue: RequestHandler = asyncHandler(async (req, res) => {
  const data = await analyticsService.revenue(req.user!.id);
  sendSuccess(res, data, { message: 'Revenue analytics retrieved' });
});

export const occupancy: RequestHandler = asyncHandler(async (req, res) => {
  const data = await analyticsService.occupancy(req.user!.id);
  sendSuccess(res, data, { message: 'Occupancy analytics retrieved' });
});

export const bookingTrend: RequestHandler = asyncHandler(async (req, res) => {
  const data = await analyticsService.bookingTrend(req.user!.id);
  sendSuccess(res, data, { message: 'Booking trend retrieved' });
});
