import axios from 'axios';
const baseUrl = '/api/EA';

const getEA = async (task, walletAddress, userId) => {
  try {
    let parsedData = JSON.parse(JSON.parse(JSON.stringify(task.data)));
    let taskParams = {
      taskId: task.id,
      promoter: task.promoter,
      startDate: task.startDate,
      endDate: task.endDate,
      cliff: task.cliff.toNumber(),
      promoterId: parsedData.promoterId,
      taskHash: parsedData.taskHash,
      platform: parsedData.platform,
      endpoint: parsedData.endpoint,
      metric: parsedData.metric,
      walletAddress: walletAddress || '',
      userId: userId || '',
    };

    console.log('Params', taskParams);

    const response = await axios.post(
      baseUrl,
      { taskParams },
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
    console.log('Response', response);
    return response;
  } catch (error) {
    console.log(error);
  }
};

const getResult = async (task, walletAddress, userId) => {
  let result = await getEA(task, walletAddress, userId);
  return result.data;
};

export default { getResult };
