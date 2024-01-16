const oddsRow = (props) => {
  const outcomes =
    props.rowObject?.bookmakers?.[0]?.markets?.[0]?.outcomes || [];

  return (
    <div className="outcome">
      {outcomes.length > 2 &&
        outcomes.map((outcome, i) => (
          <>
          <label key={i} htmlFor="teams">{outcome?.name || "Unnamed Outcome"}</label>
          <button key={i}>{outcome?.price || "Unnamed Odds"}</button>
          </>
        ))}
    </div>
  );
};

export default oddsRow;
