const ethers = require('ethers');

const unixToISO = (date) => {
  let unixDate = date;
  let newDate = new Date(unixDate);
  return newDate.toISOString().split('.')[0] + 'Z';
};

// Needs to work with array of values!!
const cliffCheck = (cliff, createdAt) => {
  const date = new Date(createdAt);
  const unixCreatedAt = Math.floor(date / 1000);
  const timeNow = Math.floor(Date.now() / 1000);
  console.log('Cliff calc:', unixCreatedAt, timeNow, timeNow - unixCreatedAt);
  if (timeNow - unixCreatedAt >= cliff) {
    return true;
  } else {
    return false;
  }
};

/*const cliffValue = (cliff, createdAt) => {
  const date = new Date(createdAt);
  const unixCreatedAt = Math.floor(date / 1000);
  const timeNow = Math.floor(Date.now() / 1000);
  return timeNow - unixCreatedAt;
};*/

const hashCheck = (checkUsers, userid, initialHash, tweetArray, cliff, metricData, taskId, isPublic) => {
  let matchingItemFound = false;
  let cliffReached = false;

  if (!checkUsers) {
    for (let i = 0; i < tweetArray.length; i++) {
      let item = tweetArray[i];
      const userAndText = userid + item.text;
      const hashed = ethers.utils.keccak256(ethers.utils.defaultAbiCoder.encode(['string'], [userAndText]));
      if (initialHash == hashed) {
        console.log('Item:', item.created_at);
        const createdAt = item.created_at;
        matchingItemFound = true;
        if (cliffCheck(cliff, createdAt)) {
          cliffReached = true;
          if (metricData === 'Time') {
            metricData = cliff;
          }
        }
        break;
      }
    }
  } else {
    for (let i = 0; i < tweetArray.length; i++) {
      let item = tweetArray[i];
      const userAndText = item.id + item.text;
      const hashed = ethers.utils.keccak256(ethers.utils.defaultAbiCoder.encode(['string'], [userAndText]));
      if (initialHash == hashed) {
        const createdAt = item.created_at;
        matchingItemFound = true;
        if (cliffCheck(cliff, createdAt)) {
          cliffReached = true;
          if (metricData == 'Time') {
            metricData = cliff;
          }
        }
        break;
      }
    }
  }

  console.log('Metric data', metricData);
  console.log('Matching item found?', matchingItemFound);
  if (!isPublic) {
    return {
      taskId: taskId,
      responseStatus: matchingItemFound ? 1 : 0,
      score: cliffReached ? metricData : 0,
    };
  } else {
    return {
      taskId: taskId,
      userId: userid,
      responseStatus: matchingItemFound ? 1 : 0,
      score: cliffReached ? metricData : 0,
    };
  }
};

module.exports = { hashCheck, cliffCheck, unixToISO };
