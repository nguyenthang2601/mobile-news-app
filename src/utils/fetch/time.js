import { get, post } from './index';
export const saveTimeSpent = async (body) => {
  const result = await post(body, 'time');
  return result;
};

export const listTimeSpent = async (param) => {
  const result = await get(param, 'time');
  return result;
};
