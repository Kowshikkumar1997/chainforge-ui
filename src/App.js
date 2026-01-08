import React, { useState } from "react";
import axios from "axios";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

import Dashboard from "./dashboard/Dashboard";
import Deployments from "./pages/Deployments";
import { API_BASE_URL } from "./config";
import { Analytics } from "@vercel/analytics/react";


/**
 * ---------------------------------------------------------------------
 * ChainForge Frontend
 * ---------------------------------------------------------------------
 *
 * Primary UI entry point for the ChainForge platform.
 *
 * Responsibilities:
 * - ERC20 / ERC721 / ERC1155 token deployment
 * - Optional feature composition (mintable, burnable, pausable)
 * - Asynchronous deployment orchestration via backend
 * - Deployment audit traceability
 *
 * Design principles:
 * - Deterministic inputs
 * - Explicit validation
 * - Clear separation of concerns
 * - No implicit side effects
 */

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

/* ---------------------------------------------------------------------
 * Home (Token Deployment & Chain Scaffold)
 * ------------------------------------------------------------------- */
function Home() {
  /* ---------------- Token Type ---------------- */
  const [tokenType, setTokenType] = useState("ERC20");

  /* ---------------- Token Parameters ---------------- */
  const [tokenName, setTokenName] = useState("");
  const [tokenSymbol, setTokenSymbol] = useState("");

  // ERC20-specific
  const [initialSupply, setInitialSupply] = useState("");
  const [decimals, setDecimals] = useState("");

  // ERC721 / ERC1155
  const [baseURI, setBaseURI] = useState("https://example.com/");

  /* ---------------- Optional Features ---------------- */
  const [modules, setModules] = useState({
    mintable: false,
    burnable: false,
    pausable: false,
  });

  /* ---------------- Chain Scaffold ---------------- */
  const [chainName, setChainName] = useState("");
  const [consensus, setConsensus] = useState("Proof of Authority");

  /* ---------------- Wallet ---------------- */
  const [walletAddress, setWalletAddress] = useState(null);
  const [walletError, setWalletError] = useState("");

  /* ---------------- Async State ---------------- */
  const [tokenLoading, setTokenLoading] = useState(false);
  const [chainLoading, setChainLoading] = useState(false);

  /* ---------------- Results & Activity ---------------- */
  const [response, setResponse] = useState("");
  const [tokenResult, setTokenResult] = useState(null);
  const [chainResult, setChainResult] = useState(null);
  const [activityLog, setActivityLog] = useState([]);

  /* -------------------------------------------------------------------
   * Handlers
   * ----------------------------------------------------------------- */

  const handleCheckboxChange = (e) => {
    setModules({ ...modules, [e.target.name]: e.target.checked });
  };

  /* ---------------- Wallet Connection ---------------- */
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

  /* ---------------- Deploy Token ---------------- */
  const handleTokenSubmit = async () => {
    if (!tokenName.trim()) {
      setResponse("Token name is required.");
      return;
    }

    if (tokenType !== "ERC1155" && !tokenSymbol.trim()) {
      setResponse("Token symbol is required.");
      return;
    }

    if (tokenType === "ERC20") {
      if (!initialSupply || Number(initialSupply) <= 0) {
        setResponse("ERC20 initial supply must be a positive number.");
        return;
      }
      if (decimals === "" || Number(decimals) < 0) {
        setResponse("ERC20 decimals must be a non-negative number.");
        return;
      }
    }

    if (tokenType === "ERC1155" && !baseURI.trim()) {
      setResponse("Base URI is required for ERC1155.");
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

      if (tokenType === "ERC721" || tokenType === "ERC1155") {
        payload.baseURI = baseURI;
      }

      const res = await api.post("/create-token", payload);

      setTokenResult(res.data);
      setResponse(res.data.message || "Deployment completed successfully.");

      setActivityLog((prev) => [
        {
          type: "token-deploy",
          label: `Deployment completed: ${tokenName} (${tokenType})`,
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

  /* ---------------- Generate Chain Scaffold ---------------- */
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

  /* -------------------------------------------------------------------
   * UI
   * ----------------------------------------------------------------- */
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="max-w-4xl w-full p-6 bg-white rounded shadow space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">ChainForge</h1>
            <p className="text-sm text-gray-600">
              Low-code infrastructure platform for deploying standardized smart contracts.
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

        {/* ---------------- Deploy Token ---------------- */}
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

          {tokenType !== "ERC1155" && (
            <input
              className="w-full p-2 border rounded"
              placeholder="Token Symbol"
              value={tokenSymbol}
              onChange={(e) => setTokenSymbol(e.target.value)}
            />
          )}

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
                placeholder="Decimals (e.g. 18)"
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

          {/* Features */}
          <div className="border rounded p-3 bg-gray-50">
            <h3 className="text-sm font-semibold mb-2">Optional Features</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <label className="flex items-center gap-2">
                <input type="checkbox" name="mintable" checked={modules.mintable} onChange={handleCheckboxChange} />
                Mintable
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" name="burnable" checked={modules.burnable} onChange={handleCheckboxChange} />
                Burnable
              </label>
              {(tokenType === "ERC721" || tokenType === "ERC1155") && (
                <label className="flex items-center gap-2">
                  <input type="checkbox" name="pausable" checked={modules.pausable} onChange={handleCheckboxChange} />
                  Pausable
                </label>
              )}
            </div>
          </div>

          <button
            onClick={handleTokenSubmit}
            disabled={tokenLoading}
            className="w-full bg-blue-600 text-white py-2 rounded disabled:opacity-60"
          >
            {tokenLoading ? "Submitting deployment…" : "Deploy Token"}
          </button>

          {response && <p className="text-center text-sm">{response}</p>}

          {tokenResult && (
            <div className="mt-4 border rounded p-3 bg-gray-50 text-sm space-y-2">
              {tokenResult.address && (
                <div><strong>Contract Address:</strong> {tokenResult.address}</div>
              )}
              {tokenResult.txHash && (
                <div><strong>Transaction:</strong> {tokenResult.txHash}</div>
              )}
              {tokenResult.network && (
                <div><strong>Network:</strong> {tokenResult.network}</div>
              )}
              {tokenResult.download && (
                <a
                  href={`${API_BASE_URL}${tokenResult.download}`}
                  target="_blank"
                  rel="noreferrer"
                  className="underline text-blue-600"
                >
                  Download deployment bundle
                </a>
              )}
            </div>
          )}
        </div>

        {/* ---------------- Chain Scaffold ---------------- */}
        <div className="border rounded p-4 space-y-3">
          <h2 className="text-xl font-semibold">Generate Chain Scaffold</h2>

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
            {chainLoading ? "Generating scaffold…" : "Generate Scaffold"}
          </button>
        </div>

        {/* ---------------- Activity Log ---------------- */}
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

/* ---------------------------------------------------------------------
 * App Router
 * ------------------------------------------------------------------- */
export default function App() {
  return (
    <Router>
      <div className="bg-black text-white px-4 py-3 flex gap-6">
        <Link to="/" className="hover:underline">Studio</Link>
        <Link to="/dashboard" className="hover:underline">Operations</Link>
        <Link to="/deployments" className="hover:underline">Deployments</Link>
      </div>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/deployments" element={<Deployments />} />
      </Routes>
      {/*  Vercel Analytics — render once at root */}
      <Analytics />
    </Router>
  );
}
