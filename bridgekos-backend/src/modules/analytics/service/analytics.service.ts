import { ForbiddenError } from '../../../core/errors.js';
import { findOwnerByUserId } from '../../owners/repository/owner.repository.js';
import {
  bookingsSince,
  overviewStats,
  paidPaymentsSince,
  roomOccupancy,
} from '../repository/analytics.repository.js';

const MONTHS = 6;
const TREND_DAYS = 30;

function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function lastNMonths(n: number): string[] {
  const keys: string[] = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    keys.push(monthKey(d));
  }
  return keys;
}

function lastNDays(n: number): Date[] {
  const days: Date[] = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    days.push(new Date(d.getFullYear(), d.getMonth(), d.getDate()));
  }
  return days;
}

async function requireOwner(userId: string) {
  const owner = await findOwnerByUserId(userId);
  if (!owner) throw new ForbiddenError('Owner profile not found');
  return owner;
}

export async function overview(userId: string) {
  const owner = await requireOwner(userId);
  return overviewStats(owner.id);
}

export async function revenue(userId: string) {
  const owner = await requireOwner(userId);
  const now = new Date();
  const since = new Date(now.getFullYear(), now.getMonth() - (MONTHS - 1), 1);

  const payments = await paidPaymentsSince(owner.id, since);
  const buckets = lastNMonths(MONTHS).reduce<Record<string, number>>((acc, key) => {
    acc[key] = 0;
    return acc;
  }, {});

  for (const payment of payments) {
    if (!payment.paidAt) continue;
    const key = monthKey(payment.paidAt);
    if (key in buckets) buckets[key] = (buckets[key] ?? 0) + payment.amount;
  }

  return {
    months: lastNMonths(MONTHS),
    revenueByMonth: Object.entries(buckets).map(([month, total]) => ({ month, total })),
    total: Object.values(buckets).reduce((sum, value) => sum + (value ?? 0), 0),
  };
}

export async function occupancy(userId: string) {
  const owner = await requireOwner(userId);
  const rooms = await roomOccupancy(owner.id);

  const available = rooms.filter((room) => room.status === 'AVAILABLE').length;
  const maintenance = rooms.filter((room) => room.status === 'MAINTENANCE').length;
  const booked = rooms.length - available - maintenance;

  return {
    totalRooms: rooms.length,
    occupiedRooms: booked,
    availableRooms: available,
    maintenanceRooms: maintenance,
    occupancyRate: rooms.length > 0 ? Math.round((booked / rooms.length) * 100) : 0,
    rooms,
  };
}

export async function bookingTrend(userId: string) {
  const owner = await requireOwner(userId);
  const now = new Date();
  const since = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (TREND_DAYS - 1));

  const bookings = await bookingsSince(owner.id, since);
  const dayBuckets = lastNDays(TREND_DAYS).reduce<Record<string, number>>((acc, date) => {
    acc[date.toISOString().slice(0, 10)] = 0;
    return acc;
  }, {});

  for (const booking of bookings) {
    const key = booking.createdAt.toISOString().slice(0, 10);
    if (key in dayBuckets) dayBuckets[key] = (dayBuckets[key] ?? 0) + 1;
  }

  return {
    days: Object.keys(dayBuckets),
    bookingsByDay: Object.entries(dayBuckets).map(([date, count]) => ({ date, count })),
    total: Object.values(dayBuckets).reduce((sum, value) => sum + (value ?? 0), 0),
  };
}
