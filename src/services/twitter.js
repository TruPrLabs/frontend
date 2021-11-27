import axios from 'axios';
const baseUrl = 'https://trupr-backend.herokuapp.com/api/twitter';

const getTwitterId = async (username) => {
  try {
    const request = await axios.get(`${baseUrl}/${username}`, { transformResponse: (data) => data.toString() });
    return request.data;
  } catch (error) {
    console.log(error.message);
  }
};

const getId = async ({ username }) => {
  let result = await getTwitterId(username);
  return result;
};

// eslint-disable-next-line import/no-anonymous-default-export
export default { getId };
