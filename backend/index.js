const axios = require('axios');
const  express = require('express');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const apiKey ="e3967818a31ad9f25447f8862c19925e"
const sportKey = 'upcoming' // use the sport_key from the /sports endpoint below, or use 'upcoming' to see the next 8 games across all sports

const regions = 'uk' // uk | us | eu | au. Multiple can be specified if comma delimited

const markets = 'h2h' // h2h | spreads | totals. Multiple can be specified if comma delimited

const oddsFormat = 'decimal' // decimal | american

const dateFormat = 'iso' // iso | unix

console.log("API Key:", apiKey);


app.get('/sporty', async(req,res,next)=>{
    const response =await axios.get('https://api.the-odds-api.com/v4/sports',{
    
    params: {
      apiKey,
    },
},

next())
.then((response) =>{ 
    res.status(200).json(response.data);
    console.log(response.data)
}
)
    .catch((error) => {

        if (error.response) {
          console.error(error.response.data);
          console.error(error.response.status);
          res.status(400).json(error.message);
        }
    
    else{
        console.error("Error", error.message);
    }})
        
}
)

//odds route
app.get('/odds', async(req,res,next)=>{
    const response =await axios.get(`https://api.the-odds-api.com/v4/sports/${sportKey}/odds/?limit=2` , {
        responseType: "json",
      },
    {
    params: {
      apiKey,
      regions,
      markets,
      oddsFormat, 
      dateFormat,
    },
},

next())
.then((response) =>{ 
    response.data.data
    console.log(JSON.stringify(response.data))
    res.status(200).json(response.data);
    console.log(response.data)

     // Check your usage
   /*  console.log('Remaining requests',response.headers['x-requests-remaining'])
    console.log('Used requests',response.headers['x-requests-used']) */
}
)
    .catch((error) => {
        if (error.response) {
          console.error(error.response.data);
          console.error(error.response.status);
          res.status(400).json(error.message);
        }
    else{
        console.error("Error", error.message);
    }})
}
)
app.listen(port , () =>{
    console.log(`Server is running on port: ${port}`)
})