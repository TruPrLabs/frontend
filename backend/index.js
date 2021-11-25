const express = require('express');
const needle = require('needle');
const { hashCheck, unixToISO, cliffCheck } = require('./helpers');

require('dotenv').config();

const app = express();

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
    let id = response.body.data.id;
    console.log('Id:', id, typeof id);
    console.log(response.body.data.id);
    res.send(response.body.data.id);
  } catch (error) {
    console.log(error.message);
  }
};

const getEAResult = async (req, res) => {
  console.log('Req.params', req.params);
  const task = req.params.task;
  console.log(task);
  /*
  let params,
  endpointURL,
  hashUserId,
  unixStartDate,
  unixEndDate,
  res,
  failedResult,
  invalidResult,
  isPublic,
  userId;

  const startTime = task.startDate;
  const endTime = task.endDate;
  

  failedResult = {
    status: 500,
    data: {
      result: {
        taskId: taskId,
        responseStatus: 2, // Error
        score: 0,
      },
    },
  };

  invalidResult = {
    status: 200,
    data: {
      result: {
        taskId: taskId,
        responseStatus: 1, // INVALID
        score: 0,
      },
    },
  };

  if (endpoint == 'UserTimeline') {
    isPublic = false;
    userId = BigInt(dataObject.promoterId);
    endpointURL = `https://api.twitter.com/2/users/${userId}/tweets`;
    hashUserId = false;
    params = {
      exclude: 'retweets,replies',
      start_time: startTime,
      end_time: endTime,
      'tweet.fields': 'public_metrics,created_at',
    };
  } else if (endpoint == 'Public') {
    isPublic = true;
    const userAddress = validator.validated.data.userAddress;
    userId = validator.validated.data.user_id;
    console.log('User Address:', userAddress, 'User id:', userId);
    endpointURL = `https://api.twitter.com/2/users/${userId}`;
    params = {
      'user.fields': 'created_at,public_metrics,description',
    };

    res = await needle("get", endpointURL, params, {
      headers: {
        authorization: `Bearer ${token}`,
      },
    });

    const checkAccountAge = cliffCheck(
      minAccountAge,
      res.body.data.created_at
    );

    userId = res.body.data.id;

    const bioArray = res.body.data.description
      .split(" ")
      .map((i) => i.toLowerCase());
    const accountBool = bioArray.includes(userAddress);
    console.log("BIO", bioArray);
    console.log("My account?", accountBool);

    if (bioArray.includes(userAddress) && checkAccountAge) {
      endpointURL = `https://api.twitter.com/2/users/${userId}/tweets`;
      hashUserId = false;
      params = {
        exclude: "retweets,replies",
        start_time: startTime,
        end_time: endTime,
        "tweet.fields": "public_metrics,created_at",
      };
    } else {
      calldone = true;
      callback(200, Requester.success(jobRunID, failedResult));
      return failedResult;
    }
  } else {
    calldone = true;
    callback(200, Requester.success(jobRunID, failedResult));
    return failedResult;
  }

  if (calldone) {
    calldone = false;
    return;
  }

  // this is the HTTP header that adds bearer token authentication
  res = await needle("get", endpointURL, params, {
    headers: {
      authorization: `Bearer ${token}`,
    },
  });

  if (res.body) {
    console.log("Resbody", res.body.data);
    if (!res.body.data) {
      callback(200, Requester.success(jobRunID, invalidResult));
      return invalidResult;
    }

    const tweetArr = res.body.data.map((obj) => {
      return obj;
    });

    res.body.data.result = hashCheck(
      hashUserId,
      userId,
      tweetHash,
      tweetArr,
      cliff,
      metric != "Time" ? res.body.data[0].public_metrics[metric] : "Time",
      taskId,
      isPublic
    );

    res.body.status = 200;
    callback(200, Requester.success(jobRunID, res.body));
    return res.body;
  } else {
    callback(500, Requester.errored(jobRunID, error));
  }

*/
};

app.get('/api/twitter/:username', getTwitterId);
app.get('/api/EA', getEAResult);

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
