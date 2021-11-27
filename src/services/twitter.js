import axios from 'axios';
const baseUrl = 'https://trupr-backend.herokuapp.com/api/twitter';
//const baseUrl = '/api/twitter';
const getTwitterId = async (username) => {
  try {
    const request = await axios.get(`${baseUrl}/${username}`, { transformResponse: (data) => data.toString() });
    return request.data;
  } catch (error) {
    console.log(error.message);
  }
};

const getTwitterHandle = async (id) => {
  try {
    const request = await axios.get(`${baseUrl}/handle/${id}`, { transformResponse: (data) => data.toString() });
    return request.data;
  } catch (error) {
    console.log(error.message);
  }
};

const getId = async ({ username }) => {
  let result = await getTwitterId(username);
  return result;
};

const getHandle = async ({ id }) => {
  let result = await getTwitterHandle(id);
  return result;
};

// eslint-disable-next-line import/no-anonymous-default-export
export default { getId, getHandle };
