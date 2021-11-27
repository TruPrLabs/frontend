import axios from 'axios';
const baseUrl = 'https://trupr-backend.herokuapp.com/api/EA';
//const baseUrl = '/api/EA';

const getEA = async (task, walletAddress, userId) => {
  try {
    //console.log('Taskdata', JSON.parse(JSON.stringify(task.data)));
    let parsedData = JSON.parse(JSON.stringify(task.data));
    //console.log('Parseddata', parsedData);
    let taskParams = {
      taskId: task.id,
      promoter: task.promoter,
      startDate: task.startDate,
      endDate: task.endDate,
      cliff: task.cliff.toNumber(),
      promoterId: parsedData.userId,
      messageHash: parsedData.messageHash,
      platform: parsedData.platform,
      endpoint: parsedData.endpoint,
      metric: parsedData.metric,
      walletAddress: walletAddress || '',
      userId: userId || '',
    };

    //console.log('Params', taskParams);

    const response = await axios.post(
      baseUrl,
      { taskParams },
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
    //console.log('Response', response);
    return response;
  } catch (error) {
    console.log(error);
  }
};

const getResult = async (task, walletAddress, userId) => {
  let result = await getEA(task, walletAddress, userId);
  //console.log('Result', result);
  return result.data;
};

export default { getResult };
