import { useState, useEffect } from 'react';
import axios from 'axios';

const ButtonComponent = () => {
  const [isGreen, setIsGreen] = useState(false);
  const [odds, setOdds] = useState([]);

  useEffect(() => {
    getOdds();
  }, []);

  const getOdds = () => {
    axios
      .get('http://localhost:5000/odds') // Replace the URL with the actual API endpoint
      .then((response) => {
        console.log(response.data);
        setOdds(response.data?.bookmakers?.[0]?.markets?.[0]?.outcomes ?? []);
      })
      .catch((error) => {
        console.error('Error fetching odds:', error);
      });
  };

  const handleButtonClick = () => {
    setIsGreen(true);
    setTimeout(() => {
      setIsGreen(false);
    }, 1000);
  };

  return (
    <div>
      <button
        style={{ color: isGreen ? 'green' : 'black' }}
        onClick={handleButtonClick}
      >
        Odds
      </button>

      {odds.length > 0 && (
        <ul>
          {odds.map((outcome, index) => (
            <li key={index}>
              {outcome.name}: {outcome.price}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ButtonComponent;
