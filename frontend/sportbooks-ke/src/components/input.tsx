// src/components/FloatInput.js
type FloatInputProps = {
  value:number 
  onChange:number
}  
= ({ value, onChange }) => {
  const handleChange = (e) => {
    const inputValue = e.target.value;

    // Check if the input matches a floating-point number with 2 decimal places
    //rejex pattern
    if (/^\d+(\.\d{0,2})?$/.test(inputValue) || inputValue === '') {
      onChange(inputValue);
    }
  };

  return <input type="text" value={value} onChange={handleChange} />;
};

export default FloatInput;
