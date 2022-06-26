import { get, post } from './index';
export const getUser = async (param) => {
  const result = await get(param, 'user');
  return result;
};
