import { get, post } from './index';
export const loginUser = async (body) => {
  const result = await post(body, 'auth/login');
  return result;
};

export const registerApi = async (body) => {
  const result = await post(body, 'auth/register');
  return result;
};
