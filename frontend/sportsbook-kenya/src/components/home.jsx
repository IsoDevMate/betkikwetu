import { useEffect, useState } from "react";
import axios from "axios";
import OddsRow from "../components/oddsRow"

const Home = () => {
  const [isGreen, setIsGreen] = useState(false);
  const [odds, setOdds] = useState([]);

  useEffect(() => {
    getOdds();
  }, []);

  const getOdds = () => {
    axios
      .get("http://localhost:5000/odds") // Replace the URL with the actual API endpoint
      .then((response) => {
        console.log(response.data);
        setOdds(response.data ?? []);
        console.log(
          "text",
          response.data?.[0].bookmakers?.[0]?.markets?.[0]?.outcomes[0]?.name
        );
      })
      .catch((error) => {
        console.error("Error fetching odds:", error);
      });
  };

  //   const handleButtonClick = () => {
  //     setIsGreen(true);
  //     setTimeout(() => {
  //       setIsGreen(false);
  //     }, 1000);
  //   };

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
