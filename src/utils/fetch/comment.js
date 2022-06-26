import { get, post } from './index';
export const saveComment = async (body) => {
  const result = await post(body, 'comment');
  return result;
};

export const getComment = async (body) => {
  const result = await post(body, 'comment/get');
  return result;
};

export const listComment = async (param) => {
  const result = await get(param, 'comment');
  return result;
};
