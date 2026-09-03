import type { Prisma } from '../../../generated/prisma/client.js';
import { ForbiddenError, NotFoundError } from '../../../core/errors.js';
import { slugifyIndonesian } from '../../../utils/slug.js';
import { findOwnerByUserId } from '../../owners/repository/owner.repository.js';
import { parsePagination, buildPaginationMeta } from '../../../common/pagination.js';
import { prisma } from '../../../utils/prisma.js';
import {
  addBoardingImage,
  boardingHouseInclude,
  createBoardingHouse,
  findBoardingHouseById,
  findBoardingHouseBySlug,
  listBoardingHouses,
  removeBoardingImage,
  slugExists,
  softDeleteBoardingHouse,
  updateBoardingHouse,
} from '../repository/boarding-house.repository.js';
import type {
  CreateBoardingInput,
  ListBoardingQuery,
  UpdateBoardingInput,
} from '../types/boarding-house.types.js';

async function generateUniqueSlug(name: string): Promise<string> {
  const base = slugifyIndonesian(name);
  let slug = base;
  let counter = 1;
  while (await slugExists(slug)) {
    slug = `${base}-${counter++}`;
  }
  return slug;
}

async function requireOwnedHouse(userId: string, houseId: string) {
  const owner = await findOwnerByUserId(userId);
  if (!owner) throw new ForbiddenError('Only owners can manage boarding houses');

  const house = await findBoardingHouseById(houseId);
  if (!house || house.ownerId !== owner.id) throw new NotFoundError('Boarding house not found');
  return { owner, house };
}

export async function create(userId: string, input: CreateBoardingInput) {
  const owner = await findOwnerByUserId(userId);
  if (!owner) throw new ForbiddenError('Only owners can create boarding houses');

  const slug = await generateUniqueSlug(input.name);
  return createBoardingHouse(owner.id, {
    ...input,
    slug,
  } as unknown as Prisma.BoardingHouseUncheckedCreateInput);
}

export async function listPublic(query: ListBoardingQuery) {
  const pagination = parsePagination(query);
  const where: Prisma.BoardingHouseWhereInput = {
    deletedAt: null,
    status: 'PUBLISHED',
  };

  const or: Prisma.BoardingHouseWhereInput[] = [];
  if (query.keyword) {
    or.push({ name: { contains: query.keyword } });
    or.push({ description: { contains: query.keyword } });
    or.push({ address: { contains: query.keyword } });
  }
  if (query.province) where.province = { contains: query.province };
  if (query.city) where.city = { contains: query.city };
  if (query.district) where.district = { contains: query.district };
  if (query.gender) where.gender = query.gender;

  const price: Prisma.FloatFilter = {};
  if (query.minPrice !== undefined) price.gte = query.minPrice;
  if (query.maxPrice !== undefined) price.lte = query.maxPrice;
  if (Object.keys(price).length > 0) {
    where.rooms = { some: { deletedAt: null, price } };
  }

  const facilities = query.facilities ?? [];

  if (or.length > 0) {
    if (where.AND) {
      where.AND = [
        ...(Array.isArray(where.AND) ? where.AND : [where.AND]),
        ...(Array.isArray(or) ? or : [or]),
      ];
    } else {
      where.OR = or;
    }
  }

  const priceSort = query.sort === 'price_asc' || query.sort === 'price_desc';
  if (priceSort || facilities.length > 0) {
    return filterAndPage(where, query.sort, facilities, pagination, priceSort);
  }

  const orderBy: Prisma.BoardingHouseOrderByWithRelationInput =
    query.sort === 'rating' ? { rating: 'desc' } : { createdAt: 'desc' };

  const { items, total } = await listBoardingHouses({
    where,
    skip: pagination.skip,
    take: pagination.take,
    orderBy,
  });

  return { items, total, meta: buildPaginationMeta(pagination, total) };
}

async function filterAndPage(
  where: Prisma.BoardingHouseWhereInput,
  sort: ListBoardingQuery['sort'],
  facilities: string[],
  pagination: { page: number; limit: number; skip: number; take: number },
  priceSort: boolean,
) {
  const orderBy: Prisma.BoardingHouseOrderByWithRelationInput =
    sort === 'rating' ? { rating: 'desc' } : { createdAt: 'desc' };
  const all = await prisma.boardingHouse.findMany({
    where,
    include: boardingHouseInclude,
    orderBy,
  });

  let filtered = all;
  if (facilities.length > 0) {
    filtered = all.filter((house) =>
      facilities.every(
        (facility) => Array.isArray(house.facilities) && house.facilities.includes(facility),
      ),
    );
  }

  let orderedIds = filtered.map((house) => house.id);
  if (priceSort) {
    const minPrices = await prisma.room.groupBy({
      by: ['boardingHouseId'],
      where: { boardingHouseId: { in: orderedIds }, deletedAt: null },
      _min: { price: true },
    });
    const priceMap = new Map(
      minPrices.map((row) => [row.boardingHouseId, row._min.price ?? Number.MAX_SAFE_INTEGER]),
    );
    const direction = sort === 'price_asc' ? 1 : -1;
    orderedIds = [...orderedIds].sort(
      (a, b) => ((priceMap.get(a) ?? 0) - (priceMap.get(b) ?? 0)) * direction,
    );
  }

  const total = orderedIds.length;
  const pageIds = orderedIds.slice(pagination.skip, pagination.skip + pagination.take);
  const items =
    pageIds.length > 0
      ? await prisma.boardingHouse.findMany({
          where: { id: { in: pageIds } },
          include: boardingHouseInclude,
        })
      : [];
  const ordered = pageIds
    .map((id) => items.find((house) => house.id === id))
    .filter((house) => house !== undefined);

  return { items: ordered, total, meta: buildPaginationMeta(pagination, total) };
}

export async function listByOwner(userId: string, query: ListBoardingQuery) {
  const owner = await findOwnerByUserId(userId);
  if (!owner) throw new ForbiddenError('Only owners can manage boarding houses');

  const pagination = parsePagination(query);
  const where: Prisma.BoardingHouseWhereInput = { ownerId: owner.id, deletedAt: null };
  if (query.keyword) {
    where.OR = [
      { name: { contains: query.keyword } },
      { description: { contains: query.keyword } },
    ];
  }
  if (query.status) where.status = query.status;

  const { items, total } = await listBoardingHouses({
    where,
    skip: pagination.skip,
    take: pagination.take,
    orderBy: { createdAt: 'desc' },
  });
  return { items, total, meta: buildPaginationMeta(pagination, total) };
}

export async function getPublicById(value: string) {
  const house =
    (await findBoardingHouseById(value)) ?? (await findBoardingHouseBySlug(value));
  if (!house || house.deletedAt || house.status !== 'PUBLISHED') {
    throw new NotFoundError('Boarding house not found');
  }
  return house;
}

/**
 * Returns a wa.me deep-link to contact the owner directly on WhatsApp.
 */
export async function getWhatsAppContact(value: string) {
  const house =
    (await findBoardingHouseById(value)) ?? (await findBoardingHouseBySlug(value));
  if (!house || house.deletedAt || house.status !== 'PUBLISHED') {
    throw new NotFoundError('Boarding house not found');
  }

  const number = house.owner.whatsappNumber || house.owner.user?.phone || null;
  if (!number) {
    throw new NotFoundError('Owner has not set a WhatsApp number yet');
  }

  const digits = number.replace(/\D/g, '').replace(/^0/, '62');
  const message = `Halo ${house.owner.businessName ?? house.owner.user.fullName ?? ''}, saya tertarik dengan '${house.name}'. Boleh info lebih lanjut?`;
  return {
    houseId: house.id,
    houseName: house.name,
    businessName: house.owner.businessName,
    number: digits,
    waLink: `https://wa.me/${digits}?text=${encodeURIComponent(message)}`,
  };
}

export async function getOwnerDetail(userId: string, id: string) {
  const { house } = await requireOwnedHouse(userId, id);
  return house;
}

export async function update(userId: string, id: string, input: UpdateBoardingInput) {
  const { house } = await requireOwnedHouse(userId, id);

  const data = { ...input } as unknown as Prisma.BoardingHouseUpdateInput;
  if (input.name && input.name !== house.name) {
    data.slug = await generateUniqueSlug(input.name);
  }

  return updateBoardingHouse(id, data);
}

export async function remove(userId: string, id: string) {
  await requireOwnedHouse(userId, id);
  await softDeleteBoardingHouse(id);
}

export async function addImage(
  userId: string,
  id: string,
  input: { url: string; isThumbnail?: boolean; order?: number },
) {
  const { house } = await requireOwnedHouse(userId, id);
  const image = await addBoardingImage(id, input);

  if (input.isThumbnail || house.thumbnail === null) {
    await updateBoardingHouse(id, { thumbnail: input.url });
  }
  return image;
}

export async function removeImage(userId: string, houseId: string, imageId: string) {
  const { house } = await requireOwnedHouse(userId, houseId);
  const exists = house.images.some((image) => image.id === imageId);
  if (!exists) throw new NotFoundError('Image not found');
  await removeBoardingImage(imageId);
}
