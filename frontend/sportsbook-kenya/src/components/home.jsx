import { useEffect, useState } from "react";
import OddsRow from "../components/oddsRow"


const Home = () => {
  const [odds, setOdds] = useState([]);
  console.log('Type of odds:', typeof odds);
  console.log('Odds:', odds);


  useEffect(() => {
    // Create a WebSocket connection
    const socket = new WebSocket('ws://localhost:5000');

    socket.onmessage = (event) => {
      const parsedData = JSON.parse(event.data);
      const { event: eventType, data } = parsedData;
  
      console.log('Received event:', eventType);
  
      if (eventType === 'oddsUpdate') {
        console.log('Received odds update:', data);
        setOdds(data);
  
        // Acknowledge the reception if needed
        socket.send('Odds update received!');
      } else {
        console.log('Unknown event type:', eventType);
      }
    };
   /* socket.onmessage = (event) => {
      const data = event.data;

        // Check if the received data is a string (Welcome message)
        if (typeof data === "string") {
          console.log("Received non-JSON data:", data);
          return;
        }

      try {
        // Attempt to parse the received message as JSON
        const jsonData = JSON.parse(data);

        // Check if the parsed data is an array
        if (Array.isArray(jsonData)) {
          console.log("backend data ", jsonData);
          setOdds(jsonData);
        } else {
          console.log("Received non-array data:", jsonData);
        }
      } catch (error) {
        // Handle the error if parsing fails
        console.error("Error parsing WebSocket message:", error);
      }
    };
    */
    // Cleanup function to close the WebSocket connection when the component unmounts
    //return () => socket.close();
  }, [ odds]);

  return (
    <div>
      <h1>Odds</h1>
        {odds.length > 0 && (
          <ul>
            {odds.map((odd, index) => (
              <OddsRow key={index} rowObject={odd} />
            ))}
          </ul>
        )}
    </div>
  );
};

export default Home;
