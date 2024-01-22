const axios = require('axios');
const express = require('express');
require('dotenv').config();
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;
const bodyParser = require('body-parser');
var prettyjson = require('prettyjson');
const crypto = require('crypto');
const socketIO = require('socket.io');
const schedule = require('node-schedule');
const {createServer} = require('http')
const { v4: uuidv4 } = require('uuid');
const redis = require('redis');

app.use(cors(
  {
    origin: 'http://localhost:5173',
    credentials: true,
  }
));  

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

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



const apiKey = process.env.API_KEY;
const sportKey = 'upcoming';
const regions = 'uk';
const markets = 'h2h';
const oddsFormat = 'decimal';
const dateFormat = 'iso';

console.log("API Key:", apiKey);



const server = createServer(app);
const io = socketIO(server);
function broadcast(event, data) {
  io.emit(event, data);
}

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

app.get('/sock-test', async (request, response)=>{
  let magic_string = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11"
  let websocket_key = request.headers["sec-websocket-key"];
  let concat_string = websocket_key + magic_string
  var shasum = crypto.createHash('sha1')
  shasum.update(concat_string)
  let encrypted_data = shasum.digest('base64')
  console.log(encrypted_data)
  response
      .status(101)
      .header({
         'Upgrade': 'websocket',
         'Connection': 'Upgrade',
         'Sec-WebSocket-Accept': encrypted_data,
         'Sec-WebSocket-Version':13
      })
      .send("alright ");
    //  console.log(response.data);
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
    // Return an appropriate response or handle the error gracefully
    return { error: 'Failed to fetch odds' };
  }
}





// Schedule a job to run every 1hr and fetch data
const job = schedule.scheduleJob('*/1 * * * *', fetchData);

// Your API route to fetch odds on demand
app.get('/odds', cacheData, fetchData,async (req, res) => {
  // let results = [];
const key = req.url;

try {

    //const results = await fetchData();\
    // Replace the following line
// const results = await fetchData();

const results = res.locals.data;

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


io.on('connection', (socket) => {
  console.log('Socket.io client connected');

  // Handle messages from Socket.io clients if needed
  socket.on('message', (message) => {
    console.log(`Received message from client: ${message}`);
  });
});



server.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});

