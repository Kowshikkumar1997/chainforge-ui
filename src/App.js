import React, { useState } from "react";
import axios from "axios";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Dashboard from "./dashboard/Dashboard";
import Deployments from "./pages/Deployments";
import { API_BASE_URL } from "./config";

/**
 * ChainForge Frontend
 *
 * Entry point for the ChainForge platform UI.
 * Provides:
 * - Token deployment (ERC20 / ERC721 / ERC1155)
 * - Chain scaffold generation (project templates)
 * - Navigation to operational dashboards and audit history
 */

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

function Home() {
  // ---------- Token Type ----------
  const [tokenType, setTokenType] = useState("ERC20");

  // ---------- Token Deployment ----------
  const [tokenName, setTokenName] = useState("");
  const [tokenSymbol, setTokenSymbol] = useState("");
  const [initialSupply, setInitialSupply] = useState("");
  const [decimals, setDecimals] = useState("");
  const [baseURI, setBaseURI] = useState("https://example.com/");

  // ---------- Chain Scaffold ----------
  const [chainName, setChainName] = useState("");
  const [consensus, setConsensus] = useState("Proof of Authority");

  // ---------- Modules ----------
  const [modules, setModules] = useState({
    governance: false,
    tokenTransfer: false,
    burnable: false,
    pausable: false,
    mintable: false,
    accessControl: false,
    ownable: false,
  });

  // ---------- Loading ----------
  const [tokenLoading, setTokenLoading] = useState(false);
  const [chainLoading, setChainLoading] = useState(false);

  // ---------- Results ----------
  const [response, setResponse] = useState("");
  const [tokenResult, setTokenResult] = useState(null);
  const [chainResult, setChainResult] = useState(null);

  // ---------- Wallet ----------
  const [walletAddress, setWalletAddress] = useState(null);
  const [walletError, setWalletError] = useState("");

  // ---------- Activity Log ----------
  const [activityLog, setActivityLog] = useState([]);

  const handleCheckboxChange = (e) => {
    setModules({ ...modules, [e.target.name]: e.target.checked });
  };

  // ---------- CONNECT WALLET ----------
  const handleConnectWallet = async () => {
    if (!window.ethereum) {
      setWalletError("MetaMask is not available in this browser.");
      return;
    }

    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      setWalletAddress(accounts[0]);
      setWalletError("");
    } catch {
      setWalletError("Wallet connection was rejected.");
    }
  };

  // ---------- DEPLOY TOKEN ----------
  const handleTokenSubmit = async () => {
    if (!tokenName.trim() || !tokenSymbol.trim()) {
      setResponse("Token name and symbol are required.");
      return;
    }

    if (tokenType === "ERC20" && (!initialSupply || Number(initialSupply) <= 0)) {
      setResponse("ERC20 initial supply must be a positive number.");
      return;
    }

    setTokenLoading(true);
    setResponse("");
    setTokenResult(null);

    try {
      const selectedModules = Object.keys(modules).filter((m) => modules[m]);

      const payload = {
        type: tokenType,
        tokenName,
        tokenSymbol,
        modules: selectedModules,
      };

      if (tokenType === "ERC20") {
        payload.initialSupply = Number(initialSupply);
        payload.decimals = Number(decimals);
      }

      if (tokenType === "ERC1155") {
        payload.baseURI = baseURI;
      }

      const res = await api.post("/create-token", payload);

      setTokenResult(res.data);
      setResponse(res.data.message);

      setActivityLog((prev) => [
        {
          type: "token-deploy",
          label: `Token deployed: ${tokenName} (${tokenType})`,
          timestamp: new Date().toISOString(),
        },
        ...prev,
      ]);
    } catch (err) {
      console.error(err);
      setResponse("Token deployment failed.");
    } finally {
      setTokenLoading(false);
    }
  };

  // ---------- GENERATE CHAIN SCAFFOLD ----------
  const handleChainSubmit = async () => {
    if (!chainName.trim()) {
      setResponse("Project name is required.");
      return;
    }

    setChainLoading(true);
    setResponse("");
    setChainResult(null);

    try {
      const res = await api.post("/create-chain", {
        chainName,
        consensusType: consensus,
        modules: Object.keys(modules).filter((m) => modules[m]),
      });

      setChainResult(res.data);
      setResponse(res.data.message);

      setActivityLog((prev) => [
        {
          type: "chain-scaffold",
          label: `Chain scaffold generated: ${chainName}`,
          timestamp: new Date().toISOString(),
        },
        ...prev,
      ]);
    } catch (err) {
      console.error(err);
      setResponse("Scaffold generation failed.");
    } finally {
      setChainLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="max-w-4xl w-full p-6 bg-white rounded shadow space-y-6">
        {/* PLATFORM HEADER */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">ChainForge</h1>
            <p className="text-sm text-gray-600">
              Low-code infrastructure platform for deploying and managing smart contracts.
            </p>
          </div>

          {walletAddress ? (
            <div className="text-sm truncate">{walletAddress}</div>
          ) : (
            <button
              onClick={handleConnectWallet}
              className="bg-orange-600 text-white px-4 py-2 rounded"
            >
              Connect Wallet
            </button>
          )}
        </div>

        {walletError && <p className="text-sm text-red-600">{walletError}</p>}

        {/* DEPLOY TOKEN */}
        <div className="border rounded p-4 space-y-3">
          <h2 className="text-xl font-semibold">Deploy Token</h2>

          <select
            className="w-full p-2 border rounded"
            value={tokenType}
            onChange={(e) => setTokenType(e.target.value)}
          >
            <option value="ERC20">ERC20</option>
            <option value="ERC721">ERC721</option>
            <option value="ERC1155">ERC1155</option>
          </select>

          <input
            className="w-full p-2 border rounded"
            placeholder="Token Name"
            value={tokenName}
            onChange={(e) => setTokenName(e.target.value)}
          />

          <input
            className="w-full p-2 border rounded"
            placeholder="Token Symbol"
            value={tokenSymbol}
            onChange={(e) => setTokenSymbol(e.target.value)}
          />

          {tokenType === "ERC20" && (
            <>
              <input
                className="w-full p-2 border rounded"
                placeholder="Initial Supply"
                type="number"
                value={initialSupply}
                onChange={(e) => setInitialSupply(e.target.value)}
              />
              <input
                className="w-full p-2 border rounded"
                placeholder="Decimals"
                type="number"
                value={decimals}
                onChange={(e) => setDecimals(e.target.value)}
              />
            </>
          )}

          {(tokenType === "ERC721" || tokenType === "ERC1155") && (
            <input
              className="w-full p-2 border rounded"
              placeholder="Base URI"
              value={baseURI}
              onChange={(e) => setBaseURI(e.target.value)}
            />
          )}

          <button
            onClick={handleTokenSubmit}
            disabled={tokenLoading}
            className="w-full bg-blue-600 text-white py-2 rounded disabled:opacity-60"
          >
            {tokenLoading ? "Deploying token..." : "Deploy Token"}
          </button>

          {response && <p className="text-center text-sm">{response}</p>}

          {tokenResult?.download && (
            <a
              href={`${API_BASE_URL}${tokenResult.download}`}
              download
              className="block text-center bg-blue-600 text-white py-2 rounded"
            >
              Download Deployment Artifacts (ZIP)
            </a>
          )}
        </div>

        {/* GENERATE CHAIN SCAFFOLD */}
        <div className="border rounded p-4 space-y-3">
          <h2 className="text-xl font-semibold">Generate Chain Scaffold</h2>
          <p className="text-sm text-gray-600">
            Generates a project scaffold and configuration files. This does not deploy or run a
            live blockchain network.
          </p>

          <input
            className="w-full p-2 border rounded"
            placeholder="Project Name"
            value={chainName}
            onChange={(e) => setChainName(e.target.value)}
          />

          <select
            className="w-full p-2 border rounded"
            value={consensus}
            onChange={(e) => setConsensus(e.target.value)}
          >
            <option value="Proof of Authority">Proof of Authority</option>
            <option value="Proof of Stake">Proof of Stake</option>
          </select>

          <button
            onClick={handleChainSubmit}
            disabled={chainLoading}
            className="w-full bg-green-600 text-white py-2 rounded disabled:opacity-60"
          >
            {chainLoading ? "Generating scaffold..." : "Generate Scaffold"}
          </button>

          {chainResult?.download && (
            <a
              href={`${API_BASE_URL}${chainResult.download}`}
              download
              className="block text-center bg-green-600 text-white py-2 rounded"
            >
              Download Scaffold (ZIP)
            </a>
          )}
        </div>

        {/* ACTIVITY LOG */}
        <div className="border rounded p-4">
          <h2 className="text-xl font-semibold">Activity Log</h2>

          {activityLog.length === 0 ? (
            <p className="text-sm text-gray-500">No activity recorded yet.</p>
          ) : (
            <ul className="text-sm space-y-1">
              {activityLog.map((item, i) => (
                <li key={i}>
                  <span className="text-gray-600">
                    {new Date(item.timestamp).toLocaleString()} —
                  </span>{" "}
                  {item.label}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <div className="bg-black text-white px-4 py-3 flex gap-6">
        <Link to="/" className="hover:underline">
          Studio
        </Link>
        <Link to="/dashboard" className="hover:underline">
          Operations
        </Link>
        <Link to="/deployments" className="hover:underline">
          Deployments
        </Link>
      </div>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/deployments" element={<Deployments />} />
      </Routes>
    </Router>
  );
}
