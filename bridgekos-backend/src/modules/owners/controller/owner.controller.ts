import { str } from '../../../utils/http.js';
import type { RequestHandler } from 'express';
import { asyncHandler } from '../../../core/async-handler.js';
import { sendSuccess } from '../../../common/response.js';
import { HttpStatus } from '../../../common/http-status.js';
import * as ownerService from '../service/owner.service.js';
import type {
  CreateBankAccountBody,
  SubmitVerificationBody,
  UpdateBankAccountBody,
  UpdateOwnerBody,
} from '../validator/owner.validator.js';

export const getMe: RequestHandler = asyncHandler(async (req, res) => {
  const owner = await ownerService.getOwnerProfile(req.user!.id);
  sendSuccess(res, owner, { message: 'Owner profile retrieved' });
});

export const updateMe: RequestHandler = asyncHandler(async (req, res) => {
  const body = req.body as UpdateOwnerBody;
  const owner = await ownerService.updateOwnerProfile(req.user!.id, body);
  sendSuccess(res, owner, { message: 'Owner profile updated' });
});

export const listBankAccounts: RequestHandler = asyncHandler(async (req, res) => {
  const accounts = await ownerService.listBankAccounts(req.user!.id);
  sendSuccess(res, accounts);
});

export const addBankAccount: RequestHandler = asyncHandler(async (req, res) => {
  const body = req.body as CreateBankAccountBody;
  const account = await ownerService.addBankAccount(req.user!.id, body);
  sendSuccess(res, account, { message: 'Bank account added' }, HttpStatus.CREATED);
});

export const updateBankAccount: RequestHandler = asyncHandler(async (req, res) => {
  const body = req.body as UpdateBankAccountBody;
  const account = await ownerService.updateBankAccountById(req.user!.id, str(req.params.id), body);
  sendSuccess(res, account, { message: 'Bank account updated' });
});

export const removeBankAccount: RequestHandler = asyncHandler(async (req, res) => {
  await ownerService.removeBankAccount(req.user!.id, str(req.params.id));
  sendSuccess(res, null, { message: 'Bank account removed' });
});

export const submitVerification: RequestHandler = asyncHandler(async (req, res) => {
  const body = req.body as SubmitVerificationBody;
  const verification = await ownerService.submitVerification(req.user!.id, body);
  sendSuccess(res, verification, { message: 'Verification submitted' }, HttpStatus.CREATED);
});
