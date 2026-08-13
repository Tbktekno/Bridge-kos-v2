import { beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { prisma } from '../src/utils/prisma.js';
import { cleanDatabase } from './helpers.js';

const app = createApp();
const uniqueEmail = () => `flow_${Date.now()}_${Math.random().toString(36).slice(2)}@test.com`;

async function registerUser(app: ReturnType<typeof createApp>, role: 'OWNER' | 'TENANT') {
  const res = await request(app)
    .post('/api/v1/auth/register')
    .send({
      email: uniqueEmail(),
      password: 'Password123',
      fullName: role === 'OWNER' ? 'Pemilik Kos' : 'Penyewa',
      role,
    });
  return {
    user: res.body.data.user,
    tokens: res.body.data.tokens,
  };
}

const auth = (token: string) => ({ Authorization: `Bearer ${token}` });

function date(daysFromNow: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString();
}

beforeEach(async () => {
  await cleanDatabase();
});

describe('End-to-end core business flow', () => {
  it('runs owner -> house -> room -> booking -> payment -> review flow', async () => {
    const owner = await registerUser(app, 'OWNER');
    const tenant = await registerUser(app, 'TENANT');

    // Owner sets up profile and a boarding house.
    const houseRes = await request(app)
      .post('/api/v1/boarding-houses')
      .set(auth(owner.tokens.accessToken))
      .send({
        name: 'Kos Mawar',
        description: 'Kos asri dekat kampus',
        gender: 'CAMPUR',
        address: 'Jl. Melati No. 5',
        province: 'DKI Jakarta',
        city: 'Jakarta Selatan',
        district: 'Kebayoran Baru',
        subdistrict: 'Cipete',
        status: 'PUBLISHED',
        facilities: ['wifi', 'ac'],
      });
    expect(houseRes.status).toBe(201);
    const houseId = houseRes.body.data.id;
    expect(houseRes.body.data.slug).toBe('kos-mawar');

    const roomRes = await request(app)
      .post('/api/v1/rooms')
      .set(auth(owner.tokens.accessToken))
      .send({ boardingHouseId: houseId, roomNumber: 'A1', price: 1500000, stock: 2 });
    expect(roomRes.status).toBe(201);
    const roomId = roomRes.body.data.id;

    const ownerProfile = await request(app)
      .get('/api/v1/owners/me')
      .set(auth(owner.tokens.accessToken));
    expect(ownerProfile.status).toBe(200);

    // Public search finds the published house
    const search = await request(app)
      .get('/api/v1/boarding-houses?city=Jakarta Selatan&facilities=wifi')
      .set(auth(tenant.tokens.accessToken));
    expect(search.status).toBe(200);
    expect(search.body.data).toHaveLength(1);

    // Tenant favorites the house
    const fav = await request(app)
      .post(`/api/v1/favorites/${houseId}`)
      .set(auth(tenant.tokens.accessToken));
    expect(fav.status).toBe(201);

    // Tenant books a room
    const bookingRes = await request(app)
      .post('/api/v1/bookings')
      .set(auth(tenant.tokens.accessToken))
      .send({ roomId, checkIn: date(5), checkOut: date(8) });
    expect(bookingRes.status).toBe(201);
    const bookingId = bookingRes.body.data.id;
    expect(bookingRes.body.data.totalPrice).toBe(1500000 * 3);
    expect(bookingRes.body.data.payment.status).toBe('PENDING');

    // Owner sees the booking and confirms it
    const ownerBookings = await request(app)
      .get('/api/v1/bookings/owner/me')
      .set(auth(owner.tokens.accessToken));
    expect(ownerBookings.status).toBe(200);
    expect(ownerBookings.body.data).toHaveLength(1);

    await request(app)
      .patch(`/api/v1/bookings/${bookingId}/confirm`)
      .set(auth(owner.tokens.accessToken));
    const payment = await prisma.payment.findUnique({ where: { bookingId } });
    expect(payment).not.toBeNull();

    // Tenant uploads receipt, owner confirms it paid
    const receipt = await request(app)
      .post(`/api/v1/payments/${payment!.id}/upload-receipt`)
      .set(auth(tenant.tokens.accessToken))
      .send({ receiptUrl: 'https://cdn.example.com/receipt.jpg' });
    expect(receipt.status).toBe(200);

    const paid = await request(app)
      .patch(`/api/v1/payments/${payment!.id}/confirm-paid`)
      .set(auth(owner.tokens.accessToken));
    expect(paid.body.data.status).toBe('PAID');

    // Owner completes the booking
    await request(app)
      .patch(`/api/v1/bookings/${bookingId}/complete`)
      .set(auth(owner.tokens.accessToken));

    // Tenant reviews the completed booking
    const reviewRes = await request(app)
      .post('/api/v1/reviews')
      .set(auth(tenant.tokens.accessToken))
      .send({ bookingId, rating: 5, comment: 'Bagus sekali' });
    expect(reviewRes.status).toBe(201);

    // Public reviews endpoint returns it
    const reviews = await request(app).get(`/api/v1/reviews/house/${houseId}`);
    expect(reviews.body.data).toHaveLength(1);

    // Owner sets a WhatsApp number, then the tenant fetches a wa.me contact link
    const ownerPatch = await request(app)
      .patch('/api/v1/owners/me')
      .set(auth(owner.tokens.accessToken))
      .send({ whatsappNumber: '081234567890' });
    expect(ownerPatch.status).toBe(200);

    const waContact = await request(app).get(`/api/v1/boarding-houses/${houseId}/contact`);
    expect(waContact.status).toBe(200);
    expect(waContact.body.data.waLink).toContain('wa.me/6281234567890');

    // Owner analytics reflect the booking
    const analytics = await request(app)
      .get('/api/v1/owners/analytics/overview')
      .set(auth(owner.tokens.accessToken));
    expect(analytics.status).toBe(200);
    expect(analytics.body.data.totalBookings).toBe(1);

    // Notifications were created for the owner
    const notifs = await request(app)
      .get('/api/v1/notifications')
      .set(auth(owner.tokens.accessToken));
    expect(notifs.status).toBe(200);
    expect(notifs.body.data.length).toBeGreaterThan(0);
  });

  it('rejects cross-tenant access to another user booking', async () => {
    const owner = await registerUser(app, 'OWNER');
    const tenantA = await registerUser(app, 'TENANT');
    const tenantB = await registerUser(app, 'TENANT');

    const house = await request(app)
      .post('/api/v1/boarding-houses')
      .set(auth(owner.tokens.accessToken))
      .send({
        name: 'Kos Mawar 2',
        address: 'Jl. Melati No. 7',
        province: 'DKI Jakarta',
        city: 'Jakarta Selatan',
        district: 'Kebayoran',
        subdistrict: 'Cipete',
        status: 'PUBLISHED',
      });
    const room = await request(app)
      .post('/api/v1/rooms')
      .set(auth(owner.tokens.accessToken))
      .send({ boardingHouseId: house.body.data.id, roomNumber: 'B1', price: 1000000 });

    const booking = await request(app)
      .post('/api/v1/bookings')
      .set(auth(tenantA.tokens.accessToken))
      .send({ roomId: room.body.data.id, checkIn: date(5), checkOut: date(6) });

    const forbidden = await request(app)
      .get(`/api/v1/bookings/${booking.body.data.id}`)
      .set(auth(tenantB.tokens.accessToken));
    expect(forbidden.status).toBe(403);
  });
});
