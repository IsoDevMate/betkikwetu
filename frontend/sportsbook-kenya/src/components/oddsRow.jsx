const oddsRow = (props) => {
  const outcomes =
    props.rowObject?.bookmakers?.[0]?.markets?.[0]?.outcomes || [];

  return (
    <div className="outcome">
      {outcomes.length > 2 &&
        outcomes.map((outcome, i) => (
          <button key={i}>{outcome?.name || "Unnamed Outcome"}</button>
        ))}
    </div>
  );
};

export default oddsRow;
