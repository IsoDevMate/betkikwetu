import { useEffect, useState } from "react";
import OddsRow from "../components/oddsRow"

const Home = () => {
  const [odds, setOdds] = useState([]);

  useEffect(() => {
    // Create a WebSocket connection
    const socket = new WebSocket('ws://localhost:5000');

    // Event listener for the 'message' event
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setOdds(data);
    };

    // Cleanup function to close the WebSocket connection when the component unmounts
   // return () => socket.close();
  }, []);

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
