const oddsRow = (props) => {
  const outcomes = props.rowObject.bookmakers?.[0]?.markets?.[0].outcomes || "";

  return (
    <div className="outcome">
      {outcomes.length > 0 &&
        outcomes.map((outcome, i) => <button key={i}>{outcome.price}</button>)}
    </div>
  );
};

export default oddsRow;
