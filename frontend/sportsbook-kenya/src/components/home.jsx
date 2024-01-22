import { useEffect, useState } from "react";
import OddsRow from "../components/oddsRow"
import io from "socket.io-client";

const Home = () => {
  const [odds, setOdds] = useState([]);
  console.log('Type of odds:', typeof odds);
  console.log('Odds:', odds);
  const socket = io("http://localhost:5000", {
    rejectUnauthorized: false
    
  });


  useEffect(() => {
    socket.on("oddsUpdate", (data) => {
      console.log('Received odds update:', data);
      setOdds(data);
      socket.on("connect_error", (err) => {
        console.log(`connect_error due to ${err.message}`);
      });
      // Acknowledge the reception if needed
      socket.emit('acknowledgeOddsUpdate', 'Odds update received!');
    });

    // Cleanup function to close the WebSocket connection when the component unmounts
    return () => {
      socket.disconnect();
    };
  }, [socket]);

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
