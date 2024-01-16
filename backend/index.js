const axios = require('axios');
const express = require('express');
require('dotenv').config();
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;
const bodyParser = require('body-parser');
var prettyjson = require('prettyjson');
const schedule = require('node-schedule');


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

var options = {
  keysColor: 'green',
  dashColor: 'magenta',
  stringColor: 'white',
  multilineStringColor: 'cyan'
};

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
   
    let result= response.data.map(game => {
      game.bookmakers = game.bookmakers.map(bookmaker => {
        bookmaker.markets = bookmaker.markets.filter(market => market.outcomes.length === 3);
        return bookmaker;
      });
      return game;
    });
    console.log(prettyjson.render(result, options));
    console.log(JSON.stringify(result));
    res.status(200).json(result);
   
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
function fetchData() {
  return axios.get(`https://api.the-odds-api.com/v4/sports/${sportKey}/odds/?limit=2`, {
    params: {
      apiKey,
      regions,
      markets,
      oddsFormat,
      dateFormat,
    },
  })
  .then(response => {
    const results = response.data.map(game => {
      game.bookmakers = game.bookmakers.map(bookmaker => {
        bookmaker.markets = bookmaker.markets.filter(market => market.outcomes.length === 3);
        return bookmaker;
      });
      return game;
    });

    console.log(prettyjson.render(results, options));
    return results;
  })
  .catch(error => {
    console.error('Error fetching odds:', error.message);
    throw error;
  });
}

// Schedule a job to run every 30 seconds and fetch data
const job = schedule.scheduleJob('*/30 * * * * *', fetchData);

// Your API route to fetch odds on demand
app.get('/odds', async (req, res) => {
  try {
    
    const results = await fetchData();
    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch odds' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
})


