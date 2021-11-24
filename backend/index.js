const express = require('express');
const needle = require('needle');

require('dotenv').config();

const app = express();

const getTwitterId = async (req, res) => {
  const params = {};
  const endpointURL = `https://api.twitter.com/2/users/by/username/${req.params.username}`;
  try {
    const response = await needle('get', endpointURL, params, {
      headers: {
        authorization: `Bearer ${process.env.BEARER_TOKEN}`,
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

app.get('/api/twitter/:username', getTwitterId);

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
