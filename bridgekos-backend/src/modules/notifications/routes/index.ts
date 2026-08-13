import { Router } from 'express';
import { authenticate } from '../../auth/middleware/authenticate.js';
import { list, markAllRead, markRead, unreadCount } from '../controller/notification.controller.js';

export const notificationRouter: Router = Router();

notificationRouter.use(authenticate);

notificationRouter.get('/', list);
notificationRouter.get('/unread-count', unreadCount);
notificationRouter.patch('/read-all', markAllRead);
notificationRouter.patch('/:id/read', markRead);
