import React, { useState } from "react";

const DeployTokenForm = () => {
  const [tokenName, setTokenName] = useState("");
  const [tokenSymbol, setTokenSymbol] = useState("");
  const [initialSupply, setInitialSupply] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [contractAddress, setContractAddress] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setContractAddress("");

    try {
      const response = await fetch("http://localhost:4000/create-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tokenName,
          tokenSymbol,
          initialSupply: parseInt(initialSupply),
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage(data.message);
        setContractAddress(data.contractAddress);
      } else {
        setMessage("❌ Deployment failed.");
      }
    } catch (err) {
      console.error(err);
      setMessage("❌ Error connecting to backend.");
    }

    setLoading(false);
  };

  return (
    <div style={{ maxWidth: "400px", margin: "50px auto", textAlign: "center" }}>
      <h2>Deploy ERC20 Token</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Token Name"
          value={tokenName}
          onChange={(e) => setTokenName(e.target.value)}
          required
          style={{ width: "100%", padding: "8px", margin: "8px 0" }}
        />
        <input
          type="text"
          placeholder="Token Symbol"
          value={tokenSymbol}
          onChange={(e) => setTokenSymbol(e.target.value)}
          required
          style={{ width: "100%", padding: "8px", margin: "8px 0" }}
        />
        <input
          type="number"
          placeholder="Initial Supply"
          value={initialSupply}
          onChange={(e) => setInitialSupply(e.target.value)}
          required
          style={{ width: "100%", padding: "8px", margin: "8px 0" }}
        />
        <button type="submit" disabled={loading} style={{ padding: "10px 20px" }}>
          {loading ? "Deploying..." : "Deploy Token"}
        </button>
      </form>

      {message && (
        <div style={{ marginTop: "20px" }}>
          <strong>{message}</strong>
          {contractAddress && (
            <div>
              Contract Address: <code>{contractAddress}</code>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DeployTokenForm;
