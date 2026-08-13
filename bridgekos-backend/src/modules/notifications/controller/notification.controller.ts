import { str } from '../../../utils/http.js';
import type { RequestHandler } from 'express';
import { asyncHandler } from '../../../core/async-handler.js';
import { sendSuccess } from '../../../common/response.js';
import * as notificationService from '../service/notification.service.js';

export const list: RequestHandler = asyncHandler(async (req, res) => {
  const result = await notificationService.list(req.user!.id, req.query);
  sendSuccess(res, result.items, { message: 'Notifications retrieved', meta: result.meta });
});

export const markRead: RequestHandler = asyncHandler(async (req, res) => {
  await notificationService.markRead(req.user!.id, str(req.params.id));
  sendSuccess(res, null, { message: 'Notification marked as read' });
});

export const markAllRead: RequestHandler = asyncHandler(async (req, res) => {
  await notificationService.markAllRead(req.user!.id);
  sendSuccess(res, null, { message: 'All notifications marked as read' });
});

export const unreadCount: RequestHandler = asyncHandler(async (req, res) => {
  const count = await notificationService.getUnreadCount(req.user!.id);
  sendSuccess(res, count, { message: 'Unread count retrieved' });
});
