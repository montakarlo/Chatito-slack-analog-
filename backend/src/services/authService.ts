import { getCustomRepository } from 'typeorm';

import UserRepository from '../data/repositories/userRepository';
import RefreshTokenRepository from '../data/repositories/refreshTokenRepository';

import { IRegisterUser } from '../common/models/user/IRegisterUser';
import { hash, compare, encrypt, decrypt } from '../common/utils/encryptHelper';
import { ILoginUser } from '../common/models/user/ILoginUser';
import {
  fromRegisterUserToCreateUser,
  fromUserToUserWithWorkspaces
} from '../common/mappers/user';
import { createToken } from '../common/utils/tokenHelper';
import { IRefreshToken } from '../common/models/refreshToken/IRefreshToken';
import { User } from '../data/entities/User';
import { IForgotPasswordUser } from '../common/models/user/IForgotPasswordUser';
import CustomError from '../common/models/CustomError';
import { sendResetPasswordMail } from './mailService';
import { ErrorCode } from '../common/enums/ErrorCode';
import { ILoginWithGoogle } from '../common/models/user/ILoginWithGoogle';
import { getGoogleUserPayload } from '../common/utils/googleAuthHelper';

const createRefreshTokenData = (user: User) => {
  const cur = new Date();
  const after30days = cur.setDate(cur.getDate() + 30);

  return {
    user,
    expiresAt: after30days
  };
};

const createRefreshToken = async (user: User): Promise<IRefreshToken> => {
  const refreshTokenData = createRefreshTokenData(user);
  const refreshToken = await getCustomRepository(RefreshTokenRepository).addToken(refreshTokenData);

  return refreshToken;
};

const addWorkspaceToUser = async (userId: string, workspaceId: string) => {
  try {
    const user = await getCustomRepository(UserRepository).addWorkspace(userId, workspaceId);
    return user;
  } catch (error) {
    throw new CustomError(409, 'User already exists in workspace. Please, sign in.', ErrorCode.UserExistsInWorkspace);
  }
};

export const register = async ({ password, workspaceId, ...userData }: IRegisterUser) => {
  const passwordHash = await hash(password);
  const createUserData = fromRegisterUserToCreateUser({ ...userData, password: passwordHash, workspaceId });

  const newUser = await getCustomRepository(UserRepository).addUser(createUserData);
  const user = workspaceId ? await addWorkspaceToUser(newUser.id, workspaceId) : newUser;

  const refreshToken = await createRefreshToken(user);

  return {
    user: fromUserToUserWithWorkspaces(user),
    accessToken: createToken({ id: newUser.id }),
    refreshToken: encrypt(refreshToken.id)
  };
};

export const login = async ({ email, password, workspaceId }: ILoginUser) => {
  const loginUser = await getCustomRepository(UserRepository).getByEmail(email);
  if (!loginUser) {
    throw new CustomError(404, 'No user exists. Please, sign up first.', ErrorCode.UserNotFound);
  }

  const comparePassword = await compare(password, loginUser.password);
  if (!comparePassword) {
    throw new CustomError(400, 'Wrong credentials. Please, try again.', ErrorCode.Unauthorized);
  }

  const user = workspaceId ? await addWorkspaceToUser(loginUser.id, workspaceId) : loginUser;

  const refreshToken = await createRefreshToken(user);

  return {
    user: fromUserToUserWithWorkspaces(user),
    accessToken: createToken({ id: loginUser.id }),
    refreshToken: encrypt(refreshToken.id)
  };
};

export const loginWithGoogle = async ({ token, workspaceId }: ILoginWithGoogle) => {
  const googleUser = await getGoogleUserPayload(token);

  const loginUser = await getCustomRepository(UserRepository).getByEmail(googleUser.email);
  if (!loginUser) {
    throw new CustomError(404, 'No user exists. Please, sign up first.', ErrorCode.UserNotFound);
  }

  const user = workspaceId ? await addWorkspaceToUser(loginUser.id, workspaceId) : loginUser;

  const refreshToken = await createRefreshToken(user);

  return {
    user: fromUserToUserWithWorkspaces(user),
    accessToken: createToken({ id: loginUser.id }),
    refreshToken: encrypt(refreshToken.id)
  };
};

export const refreshTokens = async (encryptedId: string) => {
  const id = decrypt(encryptedId);
  const refreshTokenRepository = getCustomRepository(RefreshTokenRepository);

  const refreshToken = await refreshTokenRepository.getById(id);

  if (!refreshToken) {
    throw new CustomError(401, 'Invalid refresh token', ErrorCode.InvalidRefreshToken);
  }

  if (Date.now() > refreshToken.expiresAt) {
    await refreshTokenRepository.deleteToken(id);
    throw new CustomError(401, 'Refresh token expired', ErrorCode.InvalidRefreshToken);
  }

  const user = await getCustomRepository(UserRepository).getById(refreshToken.userId);
  const newRefreshToken = await createRefreshToken(user);

  await refreshTokenRepository.deleteToken(id);

  return {
    accessToken: createToken({ id: newRefreshToken.userId }),
    refreshToken: encrypt(newRefreshToken.id)
  };
};

export const forgotPassword = async ({ email }: IForgotPasswordUser) => {
  const user = await getCustomRepository(UserRepository).getByEmail(email);
  if (!user) {
    throw new CustomError(404, 'Wrong email', ErrorCode.UserNotFound);
  }
  await sendResetPasswordMail({ to: email, token: createToken({ id: user.id }) });
  return user;
};

export const resetPassword = async (id: string, password: string) => {
  const passwordHash = await hash(password);
  const user = await getCustomRepository(UserRepository).editPassword(id, passwordHash);
  return user;
};

export const removeToken = async (token: string) => {
  try {
    const id = decrypt(token);
    const refreshTokenRepository = getCustomRepository(RefreshTokenRepository);
    await refreshTokenRepository.deleteToken(id);
    return { result: true };
  } catch (err) {
    throw new CustomError(501, 'Refresh Token Invalid !', ErrorCode.InvalidRefreshToken, err);
  }
};
