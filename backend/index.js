const express = require('express');
const needle = require('needle');

require('dotenv').config();

const app = express();

const getTwitterId = async (req, res) => {
  const params = {};

  const endpointURL = `https://api.twitter.com/2/users/by/username/${req.params.username}`;

  const response = await needle('get', endpointURL, params, {
    headers: {
      authorization: `Bearer ${process.env.BEARER_TOKEN}`,
    },
  });

  if (response.statusCode !== 200) {
    if (response.statusCode === 403) {
      res.status(403).send(response.body);
    } else {
      //console.log('Error', response.error);
      throw new Error(response.body.errors.detail);
    }
  }
  if (response.body) {
    return response.body.id;
  } else throw new Error('Unsuccessful Request');
};

app.get('/api/twitter/:username', getTwitterId);

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
