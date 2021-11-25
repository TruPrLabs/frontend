import axios from 'axios';
const baseUrl = '/api/EA';

const getEA = async (task) => {
  try {
    console.log('getEA', task);
    let parsedData = JSON.parse(JSON.stringify(task.data));
    //console.log('JSON', parsedData);
    console.log('promoterId:', JSON.parse(parsedData));
    const req = await axios.get(baseUrl, task);
  } catch (error) {
    console.log(error);
  }
};

export default { getEA };
