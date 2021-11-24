import axios from 'axios';
const baseUrl = '/api/twitter';

const getTwitterId = async ({ username }) => {
  try {
    console.log('Called get');
    const res = await axios.get(`${baseUrl}/${username}`);
    console.log('Res', res);
  } catch {}
  /*
  const request = axios.get(`${baseUrl}/${username}`);
  return request.then((response) => {
    console.log('Service response', response.data);
    return response.data;
  });*/
};

// eslint-disable-next-line import/no-anonymous-default-export
export default { getTwitterId };
