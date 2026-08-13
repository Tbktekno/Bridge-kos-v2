import { str } from '../../../utils/http.js';
import type { RequestHandler } from 'express';
import { asyncHandler } from '../../../core/async-handler.js';
import { sendSuccess } from '../../../common/response.js';
import { HttpStatus } from '../../../common/http-status.js';
import { parseStringList } from '../../../common/pagination.js';
import * as boardingHouseService from '../service/boarding-house.service.js';
import type {
  AddImageBody,
  CreateBoardingHouseBody,
  ListBoardingHousesQuery,
  UpdateBoardingHouseBody,
} from '../validator/boarding-house.validator.js';

export const list: RequestHandler = asyncHandler(async (req, res) => {
  const q = (req.query as ListBoardingHousesQuery) ?? {};
  const facilities = parseStringList(q.facilities);
  const result = await boardingHouseService.listPublic({
    page: q.page,
    limit: q.limit,
    keyword: q.keyword,
    province: q.province,
    city: q.city,
    district: q.district,
    gender: q.gender,
    minPrice: q.minPrice,
    maxPrice: q.maxPrice,
    facilities,
    sort: q.sort,
  });
  sendSuccess(res, result.items, { message: 'Boarding houses retrieved', meta: result.meta });
});

export const listMine: RequestHandler = asyncHandler(async (req, res) => {
  const q = req.query as ListBoardingHousesQuery;
  const result = await boardingHouseService.listByOwner(req.user!.id, {
    ...q,
    facilities: parseStringList(q.facilities),
  });
  sendSuccess(res, result.items, { message: 'Boarding houses retrieved', meta: result.meta });
});

export const detail: RequestHandler = asyncHandler(async (req, res) => {
  const house = await boardingHouseService.getPublicById(str(req.params.id));
  sendSuccess(res, house, { message: 'Boarding house retrieved' });
});

export const whatsappContact: RequestHandler = asyncHandler(async (req, res) => {
  const contact = await boardingHouseService.getWhatsAppContact(str(req.params.id));
  sendSuccess(res, contact, { message: 'WhatsApp contact retrieved' });
});

export const detailOwner: RequestHandler = asyncHandler(async (req, res) => {
  const house = await boardingHouseService.getOwnerDetail(req.user!.id, str(req.params.id));
  sendSuccess(res, house, { message: 'Boarding house retrieved' });
});

export const createBoardingHouse: RequestHandler = asyncHandler(async (req, res) => {
  const body = req.body as CreateBoardingHouseBody;
  const house = await boardingHouseService.create(req.user!.id, body);
  sendSuccess(res, house, { message: 'Boarding house created' }, HttpStatus.CREATED);
});

export const updateBoardingHouse: RequestHandler = asyncHandler(async (req, res) => {
  const body = req.body as UpdateBoardingHouseBody;
  const house = await boardingHouseService.update(req.user!.id, str(req.params.id), body);
  sendSuccess(res, house, { message: 'Boarding house updated' });
});

export const remove: RequestHandler = asyncHandler(async (req, res) => {
  await boardingHouseService.remove(req.user!.id, str(req.params.id));
  sendSuccess(res, null, { message: 'Boarding house deleted' });
});

export const addImage: RequestHandler = asyncHandler(async (req, res) => {
  const body = req.body as AddImageBody;
  const image = await boardingHouseService.addImage(req.user!.id, str(req.params.id), body);
  sendSuccess(res, image, { message: 'Image added' }, HttpStatus.CREATED);
});

export const removeImage: RequestHandler = asyncHandler(async (req, res) => {
  await boardingHouseService.removeImage(req.user!.id, str(req.params.id), str(req.params.imageId));
  sendSuccess(res, null, { message: 'Image removed' });
});
