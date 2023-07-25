
import  { useState } from 'react';

const ButtonComponent = () => {
  const [isGreen, setIsGreen] = useState(false);

  const handleButtonClick = () => {
    setIsGreen(true);
    setTimeout(() => {
      setIsGreen(false);
    }, 2000);
  };

  return (
    <button
      style={{ color: isGreen ? 'green' : 'black' }}
      onClick={handleButtonClick}
    >
      Odds
    </button>
    
  );
};

export default ButtonComponent;
