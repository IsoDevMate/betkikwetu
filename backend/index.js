const axios = require('axios');
const express = require('express');
require('dotenv').config();
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;
const bodyParser = require('body-parser');


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const apiKey = process.env.API_KEY;
const sportKey = 'upcoming';
const regions = 'uk';
const markets = 'h2h';
const oddsFormat = 'decimal';
const dateFormat = 'iso';

console.log("API Key:", apiKey);

app.get('/sporty', async (req, res) => {
  try {
    const response = await axios.get('https://api.the-odds-api.com/v4/sports', {
      params: {
        apiKey,
      },
    });
    res.status(200).json(response.data);
    console.log(response.data);
  } catch (error) {
    if (error.response) {
      console.error(error.response.data);
      console.error(error.response.status);
      res.status(400).json(error.message);
    } else {
      console.error("Error", error.message);
    }
  }
});

app.get('/odds', async (req, res) => {
  try {
    const response = await axios.get(`https://api.the-odds-api.com/v4/sports/${sportKey}/odds/?limit=2`, {
      params: {
        apiKey,
        regions,
        markets,
        oddsFormat,
        dateFormat,
      },
    });
    console.log(JSON.stringify(response.data));
    res.status(200).json(response.data);

    // Check your usage
    // console.log('Remaining requests', response.headers['x-requests-remaining'])
    // console.log('Used requests', response.headers['x-requests-used'])
  } catch (error) {
    if (error.response) {
      console.error(error.response.data);
      res.status(401).json({ message: 'API key is missing' });
    } else {
      console.error("Error", error.message);
    }
  }
});

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
