const axios = require('axios');
const express = require('express');
require('dotenv').config();
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;
const bodyParser = require('body-parser');
var prettyjson = require('prettyjson');
//const schedule = require('node-schedule');
const {createServer} = require('http')
const {createServerFrom} = require('wss')
const http = createServer()
const WebSocket = require('ws');
const wss = new WebSocket.Server({ noServer: true });
const { v4: uuidv4 } = require('uuid');
const redis = require('redis');

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


let redisClient;
//self invoked function to connect to redis
(async () => {
  redisClient = redis.createClient();

  redisClient.on("error", (error) => console.error(`Error : ${error}`));

  await redisClient.connect();
})();


// Broadcast function to send data to all connected clients
function broadcast(event, data) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ event, data }));
    }
  });
}

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

async function cacheData(req, res, next) {
  const  key  = req.url;
  let results;
  try {
    const cacheResults = await redisClient.get(key);
    if (cacheResults) {
      results = JSON.parse(cacheResults);
      res.send({
        fromCache: true,
        data: results,
      });
    } else {
      next();
    }
  } catch (error) {
    console.error(error);
    res.status(404);
  }
}

 

const fetchData = async () => {
try{
    const response = await axios.get(`https://api.the-odds-api.com/v4/sports/${sportKey}/odds/?limit=2`, {
      params: {
        apiKey,
         regions,
         markets,
        oddsFormat,
        dateFormat,
      },
    });
    console.log("Request sent to the API");
    
      const results = response.data.map(game => {
      game.bookmakers = game.bookmakers.map(bookmaker => {
        console.log("Before filtering:", bookmaker.markets);
        const filteredMarkets =  bookmaker.markets.filter(market => market.outcomes.length === 3);
        bookmaker.markets = filteredMarkets.length > 0 ? filteredMarkets : bookmaker.markets;
        console.log("After filtering:", bookmaker.markets);
        return bookmaker;
      });
      return game;
    });

    console.log(prettyjson.render(results, options));
    console.log(JSON.stringify(results));
    
   
  } catch (error) {
     console.error('Error fetching odds:', error.message);
    throw error;
  }
}





// Schedule a job to run every 1hr and fetch data
//const job = schedule.scheduleJob('*/1 * * * *', fetchData);

// Your API route to fetch odds on demand
app.get('/odds', cacheData, fetchData,async (req, res) => {
  // let results = [];
const key = req.url;

try {

    const results = await fetchData();
    let stringres = JSON.stringify(results);

    await redisClient.set(key, stringres, {
      EX: 3600,
      NX: true,
    });
  res.status(200).send({
  fromCache: false,
  data: stringres
 })
 
  
 
    //broadcast to the front end 
    //res.send(result);
  //  clients.get(req.cookies.id).send(results)
    broadcast('oddsUpdate', stringres);
}
   catch (error) {
    res.status(500).json({ error: 'Failed to fetch odds' });
  }
}
);


const clients = new Map();
// Handle WebSocket connections
wss.on('connection', (ws,r) => {
 // const id = uuidv4();
 // clients.set(id, ws);
  console.log('WebSocket client connected');
 
  // Handle messages from WebSocket clients if needed
  ws.on('message', (message) => {
    console.log(`Received message from client: ${message}`);
  });
 
  // Send a welcome message to the newly connected client
  //ws.send('Welcome to the WebSocket server!');
});

// HTTP server with WebSocket upgrade support
const server = createServer(app);
server.on('upgrade', (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit('connection', ws, request);
  });
});

// Start the HTTP server
server.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
/*
http.on('upgrade', (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit('connection', ws, request);
  });
});

http.on('request', app);

http.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});

*/
