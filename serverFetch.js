import 'isomorphic-unfetch';
import { GET_HOST } from './constants';

const mapResponse = async (response) => {
  const code = response.status;
  let body = {};

  if (code === 200) {
    body = await response.json().catch(() => ({}));
  } else if (code === 400 || code === 409) {
    body = await response.text();
  } else if (code === 500) {
    console.log(await response.text());
  }

  return body;
};

const proxyFetch = () => {
  const request = {
    method: 'GET',
    headers: { ['Content-Type']: 'application/json' }
  };

  return fetch(`${GET_HOST}/data`, request)
    .then(mapResponse)
    .catch((err) => { console.log(err); return { PROXY_ERROR: true } });
};

export default {
  get: async () => proxyFetch('GET')
};
