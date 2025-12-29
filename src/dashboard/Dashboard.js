import React, { useMemo, useState } from "react";
import axios from "axios";

/**
 * Contract Operations Dashboard
 *
 * Provides operational controls for interacting with deployed smart contracts:
 * - Minting (ERC721 / ERC1155)
 * - Balance inspection (ERC20 / ERC721 / ERC1155)
 *
 * This dashboard assumes contracts were generated and deployed via ChainForge.
 */

const API_BASE_URL = "http://localhost:4000";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

function Dashboard() {
  // ---------- Contract Metadata ----------
  const [contractAddress, setContractAddress] = useState("");
  const [contractFileName, setContractFileName] = useState("");
  const [contractName, setContractName] = useState("");
  const [tokenType, setTokenType] = useState("ERC20");

  // ---------- Mint ----------
  const [mintAmount, setMintAmount] = useState("");
  const [mintId, setMintId] = useState("");
  const [mintStatus, setMintStatus] = useState("");

  // ---------- Balance ----------
  const [wallet, setWallet] = useState("");
  const [balance, setBalance] = useState(null);

  // ---------- Normalized Inputs ----------
  const addr = contractAddress.trim();
  const file = contractFileName.trim();
  const name = contractName.trim();
  const wal = wallet.trim();

  const requiresIdAndAmount = tokenType === "ERC1155";

  const canMint = useMemo(() => {
    if (!addr || !file || !name || !wal) return false;
    if (tokenType === "ERC20") return false;
    if (requiresIdAndAmount) return mintId.trim() !== "" && mintAmount.trim() !== "";
    return true;
  }, [addr, file, name, wal, tokenType, requiresIdAndAmount, mintId, mintAmount]);

  const canCheckBalance = useMemo(() => {
    if (!addr || !file || !name || !wal) return false;
    if (tokenType === "ERC1155") return mintId.trim() !== "";
    return true;
  }, [addr, file, name, wal, tokenType, mintId]);

  // ---------------------------
  // Mint
  // ---------------------------
  const handleMint = async () => {
    setMintStatus("Submitting transaction...");

    try {
      const payload = {
        contractAddress: addr,
        contractFileName: file,
        contractName: name,
        tokenType,
        to: wal,
      };

      if (tokenType === "ERC1155") {
        payload.id = Number(mintId);
        payload.amount = Number(mintAmount);
      }

      const res = await api.post("/mint", payload);

      setMintStatus(`Mint successful. Transaction hash: ${res.data.txHash}`);
    } catch (err) {
      console.error(err);
      setMintStatus("Mint operation failed.");
    }
  };

  // ---------------------------
  // Balance
  // ---------------------------
  const handleCheckBalance = async () => {
    try {
      const payload = {
        contractAddress: addr,
        contractFileName: file,
        contractName: name,
        wallet: wal,
        tokenType,
      };

      if (tokenType === "ERC1155") payload.id = Number(mintId);

      const res = await api.post("/balance", payload);
      setBalance(res.data.balance);
    } catch (err) {
      console.error(err);
      setBalance("Unable to fetch balance.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full bg-white p-6 rounded shadow">
        <h1 className="text-3xl font-bold text-center mb-2">
          Contract Operations Console
        </h1>

        <p className="text-sm text-gray-600 text-center mb-6">
          Interact with deployed smart contracts generated via ChainForge.
        </p>

        {/* Contract Inputs */}
        <input
          className="w-full p-3 border mb-3 rounded"
          placeholder="Contract Address"
          value={contractAddress}
          onChange={(e) => setContractAddress(e.target.value)}
        />

        <input
          className="w-full p-3 border mb-1 rounded"
          placeholder="Contract File Name (e.g. ImpactNFT_ERC721_123.sol)"
          value={contractFileName}
          onChange={(e) => setContractFileName(e.target.value)}
        />
        <p className="text-xs text-gray-500 mb-3">
          Must match Hardhat artifact path.
        </p>

        <input
          className="w-full p-3 border mb-4 rounded"
          placeholder="Contract Name (e.g. ImpactNFT)"
          value={contractName}
          onChange={(e) => setContractName(e.target.value)}
        />

        <select
          className="w-full p-3 border mb-4 rounded"
          value={tokenType}
          onChange={(e) => {
            setTokenType(e.target.value);
            setMintStatus("");
            setBalance(null);
          }}
        >
          <option value="ERC20">ERC20</option>
          <option value="ERC721">ERC721</option>
          <option value="ERC1155">ERC1155</option>
        </select>

        <input
          className="w-full p-3 border mb-4 rounded"
          placeholder="Wallet Address"
          value={wallet}
          onChange={(e) => setWallet(e.target.value)}
        />

        {/* Mint */}
        <h2 className="text-xl font-semibold mb-2">Mint Tokens</h2>

        {tokenType === "ERC20" && (
          <p className="text-sm text-gray-600 mb-3">
            ERC20 tokens are deployed with fixed supply. Minting is disabled.
          </p>
        )}

        {tokenType === "ERC1155" && (
          <>
            <input
              className="w-full p-3 border mb-3 rounded"
              placeholder="Token ID"
              value={mintId}
              onChange={(e) => setMintId(e.target.value)}
            />
            <input
              className="w-full p-3 border mb-3 rounded"
              placeholder="Amount"
              value={mintAmount}
              onChange={(e) => setMintAmount(e.target.value)}
            />
          </>
        )}

        <button
          onClick={handleMint}
          disabled={!canMint}
          className={`w-full py-3 rounded text-white transition ${
            canMint
              ? "bg-blue-600 hover:bg-blue-700"
              : "bg-gray-400 cursor-not-allowed"
          }`}
        >
          Execute Mint
        </button>

        {mintStatus && <p className="mt-3 text-sm">{mintStatus}</p>}

        {/* Balance */}
        <h2 className="text-xl font-semibold mt-6 mb-2">Check Balance</h2>

        <button
          onClick={handleCheckBalance}
          disabled={!canCheckBalance}
          className={`w-full py-3 rounded text-white transition ${
            canCheckBalance
              ? "bg-green-600 hover:bg-green-700"
              : "bg-gray-400 cursor-not-allowed"
          }`}
        >
          Fetch Balance
        </button>

        {balance !== null && (
          <p className="mt-3 font-semibold">Balance: {balance}</p>
        )}
      </div>
    </div>
  );
}

export default Dashboard;