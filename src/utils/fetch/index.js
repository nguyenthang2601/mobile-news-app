import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../constant/api.constant';

const setup = async (method) => {
  const token = await AsyncStorage.getItem('token');
  try {
    const defaultOptions = {
      method: method ? method : 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token,
      },
    };
    return defaultOptions;
  } catch (error) {}
};
export const get = async (params, url) => {
  const key = Object.keys(params);
  let query = '';
  key.map((item) => {
    query = query + `${key}=${params[item]}&`;
  });
  const link = params !== '' ? `${API_URL}${url}?${query}` : `${API_URL}${url}`;
  console.log('link', link);
  const result = await fetch(link, await setup())
    .then((data) => data.json())
    .then((res) => res.data)
    .catch((error) => {
      console.log(error);
    });

  return result;
};

export const post = async (body, url) => {
  const result = await fetch(`${API_URL}${url}`, {
    ...(await setup('POST')),
    body: JSON.stringify(body),
  })
    .then((data) => data.json())
    .then((res) => {
      if (res.success) {
        if (res?.data) {
          return res.data;
        }

        return true;
      } else {
        return res;
      }
    })
    .catch((error) => {
      console.log(error);
      return false;
    });

  return result;
};

export const remove = async (body, url, id) => {
  let link;
  if (id) {
    link = `${API_URL}${url}/${id}`;
  } else {
    link = `${API_URL}${url}`;
  }
  const result = await fetch(link, {
    ...(await setup('DELETE')),
    body: JSON.stringify(body),
  })
    .then((data) => data.json())
    .then((res) => res.data)
    .catch((error) => {
      console.log(error);
      return false;
    });

  return result;
};
