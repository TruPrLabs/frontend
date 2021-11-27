const express = require('express');
const needle = require('needle');
const cors = require('cors');
const { hashCheck, unixToISO, cliffCheck } = require('./helpers');

require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const token = process.env.BEARER_TOKEN;

const getTwitterId = async (req, res) => {
  const params = {};
  const endpointURL = `https://api.twitter.com/2/users/by/username/${req.params.username}`;
  try {
    const response = await needle('get', endpointURL, params, {
      headers: {
        authorization: `Bearer ${token}`,
      },
    });

    console.log(response.body.data.id);
    res.send(response.body.data.id);
  } catch (error) {
    console.log(error.message);
  }
};

const getEAResult = async (req, res) => {
  console.log('Res.body', req.body.taskParams);
  //  res.status(200).send(req.body.taskParams);
  // return;
  const task = req.body.taskParams;

  let params, endpointURL, hashUserId, response, failedResult, invalidResult, isPublic, userId, calldone;
  const minAccountAge = 2592000;
  const startTime = unixToISO(task.startDate);
  const endTime = unixToISO(task.endDate);
  const taskId = task.taskId;
  const endpoint = task.endpoint;
  const messageHash = task.messageHash;
  const metric = task.metric;
  const cliff = task.cliff;
  const platform = task.platform;

  failedResult = {
    status: 500,
    data: {
      taskId: taskId,
      responseStatus: 2, // Error
      score: 0,
    },
  };

  invalidResult = {
    status: 200,
    data: {
      taskId: taskId,
      responseStatus: 0, // INVALID
      score: 0,
    },
  };

  if (endpoint === 'UserTimeline') {
    isPublic = false;
    userId = task.promoterId;
    endpointURL = `https://api.twitter.com/2/users/${userId}/tweets`;
    hashUserId = false;
    params = {
      exclude: 'retweets,replies',
      start_time: startTime,
      end_time: endTime,
      'tweet.fields': 'public_metrics,created_at',
    };
  } else if (endpoint === 'Public') {
    isPublic = true;
    const userAddress = task.walletAddress.toLowerCase();
    userId = task.userId;
    endpointURL = `https://api.twitter.com/2/users/${userId}`;
    params = {
      'user.fields': 'created_at,public_metrics,description',
    };

    response = await needle('get', endpointURL, params, {
      headers: {
        authorization: `Bearer ${token}`,
      },
    });
    console.log('Response public', response.body);

    const checkAccountAge = cliffCheck(minAccountAge, response.body.data.created_at);

    userId = response.body.data.id;

    const bioArray = response.body.data.description.split(' ').map((i) => i.toLowerCase());
    const accountBool = bioArray.includes(userAddress.toLowerCase());
    console.log('BIO', bioArray);
    console.log('My account?', accountBool);

    if (bioArray.includes(userAddress) && checkAccountAge) {
      endpointURL = `https://api.twitter.com/2/users/${userId}/tweets`;
      hashUserId = false;
      params = {
        exclude: 'retweets,replies',
        start_time: startTime,
        end_time: endTime,
        'tweet.fields': 'public_metrics,created_at',
      };
    } else {
      calldone = true;
      res.send(failedResult);
      return failedResult;
    }
  } else {
    calldone = true;
    res.send(failedResult);
    return failedResult;
  }

  if (calldone) {
    calldone = false;
    return;
  }

  // this is the HTTP header that adds bearer token authentication
  response = await needle('get', endpointURL, params, {
    headers: {
      authorization: `Bearer ${token}`,
    },
  });

  if (response.body) {
    console.log('Resbody', response.body);
    if (!response.body.data) {
      res.send(invalidResult);
      return invalidResult;
    }

    const tweetArr = response.body.data.map((obj) => {
      return obj;
    });
    console.log('Metric test', metric !== 'Time');
    response.body.data = hashCheck(
      hashUserId,
      userId,
      messageHash,
      tweetArr,
      cliff,
      metric !== 'Time' ? response.body.data[0].public_metrics[metric] : 'Time',
      taskId,
      isPublic
    );

    res.status(200).send(response.body.data);

    return response.body;
  } else {
    res.status(500).send('Error');
  }
};

app.get('/api/twitter/:username', getTwitterId);
app.post('/api/EA/', getEAResult);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
