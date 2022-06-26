import { get, post, remove } from './index';
export const saveDraft = async (body) => {
  const result = await post(body, 'new-draft');
  return result;
};

export const deleteDraft = async (body, id) => {
  const result = await remove(body, 'new-draft', id);
  return result;
};

export const detailDraft = async (body) => {
  const result = await post(body, 'new-draft/detail');

  if (result.statusCode) {
    return false;
  }
  return result;
};

export const listDraft = async (param) => {
  const result = await get(param, 'new-draft');
  return result;
};
