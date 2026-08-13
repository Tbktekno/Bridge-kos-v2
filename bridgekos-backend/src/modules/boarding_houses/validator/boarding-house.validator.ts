import { z } from 'zod';

const stringArray = (max: number) => z.array(z.string().trim().min(1).max(60)).max(max).optional();

export const createBoardingHouseSchema = z.object({
  body: z.object({
    name: z.string().trim().min(3, 'Name must be at least 3 characters').max(120),
    description: z.string().trim().max(5000).optional(),
    category: z.string().trim().max(60).optional(),
    gender: z.enum(['CAMPUR', 'PUTRA', 'PUTRI']).default('CAMPUR'),
    address: z.string().trim().min(5, 'Address is required').max(300),
    province: z.string().trim().min(2).max(100),
    city: z.string().trim().min(2).max(100),
    district: z.string().trim().min(2).max(100),
    subdistrict: z.string().trim().min(2).max(100),
    postalCode: z.string().trim().max(10).optional().nullable(),
    latitude: z.coerce.number().min(-90).max(90).optional().nullable(),
    longitude: z.coerce.number().min(-180).max(180).optional().nullable(),
    googleMapsUrl: z.string().url().optional().nullable(),
    thumbnail: z.string().url('Invalid thumbnail URL').optional().nullable(),
    facilities: stringArray(30),
    rules: stringArray(30),
    nearbyPlaces: stringArray(30),
    operationalHours: z.any().optional(),
    status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
  }),
});

export const updateBoardingHouseSchema = z.object({
  body: z.object({
    name: z.string().trim().min(3).max(120).optional(),
    description: z.string().trim().max(5000).optional(),
    category: z.string().trim().max(60).optional(),
    gender: z.enum(['CAMPUR', 'PUTRA', 'PUTRI']).optional(),
    address: z.string().trim().min(5).max(300).optional(),
    province: z.string().trim().min(2).max(100).optional(),
    city: z.string().trim().min(2).max(100).optional(),
    district: z.string().trim().min(2).max(100).optional(),
    subdistrict: z.string().trim().min(2).max(100).optional(),
    postalCode: z.string().trim().max(10).optional().nullable(),
    latitude: z.coerce.number().min(-90).max(90).optional().nullable(),
    longitude: z.coerce.number().min(-180).max(180).optional().nullable(),
    googleMapsUrl: z.string().url().optional().nullable(),
    thumbnail: z.string().url().optional().nullable(),
    facilities: stringArray(30),
    rules: stringArray(30),
    nearbyPlaces: stringArray(30),
    operationalHours: z.any().optional(),
    status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
  }),
});

export const listBoardingHousesQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
    keyword: z.string().trim().max(120).optional(),
    province: z.string().trim().max(100).optional(),
    city: z.string().trim().max(100).optional(),
    district: z.string().trim().max(100).optional(),
    gender: z.enum(['CAMPUR', 'PUTRA', 'PUTRI']).optional(),
    minPrice: z.coerce.number().min(0).optional(),
    maxPrice: z.coerce.number().min(0).optional(),
    facilities: z.string().trim().optional(),
    sort: z.enum(['latest', 'rating', 'price_asc', 'price_desc']).optional(),
  }),
});

export const addImageSchema = z.object({
  body: z.object({
    url: z.string().url('Invalid image URL'),
    isThumbnail: z.boolean().optional(),
    order: z.coerce.number().int().min(0).optional(),
  }),
});

export type CreateBoardingHouseBody = z.infer<typeof createBoardingHouseSchema>['body'];
export type UpdateBoardingHouseBody = z.infer<typeof updateBoardingHouseSchema>['body'];
export type ListBoardingHousesQuery = z.infer<typeof listBoardingHousesQuerySchema>['query'];
export type AddImageBody = z.infer<typeof addImageSchema>['body'];
