import React, { useEffect, useMemo, useState } from "react";
import { API_BASE_URL } from "../config";

/**
 * ChainForge — Deployment History
 *
 * This component represents an immutable, verifiable audit ledger of
 * smart contracts deployed through the ChainForge orchestration layer.
 *
 * Core principles:
 * - Backend is the single source of truth.
 * - UI reflects persisted verification lifecycle state only.
 * - No client-side mutation of deployment records.
 * - Explorer links enable independent public verification.
 * - Privacy Mode affects presentation only.
 */

function shorten(value) {
  if (!value || typeof value !== "string") return "-";
  if (value.length <= 12) return value;
  return `${value.slice(0, 6)}…${value.slice(-4)}`;
}

function safeString(value) {
  if (value === null || value === undefined) return "";
  if (typeof value === "string" && value.trim().length === 0) return "";
  return String(value);
}

function getExplorerBaseUrl(network) {
  const key = (network || "").toLowerCase();
  const map = {
    sepolia: "https://sepolia.etherscan.io",
    mainnet: "https://etherscan.io",
    goerli: "https://goerli.etherscan.io",
    holesky: "https://holesky.etherscan.io",
  };
  return map[key] || null;
}

function formatDate(iso) {
  if (!iso) return "-";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString();
}

export default function Deployments() {
  const [deployments, setDeployments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [privacyMode, setPrivacyMode] = useState(true);

  /* -------------------------------------------------------
     Load deployment history
  ------------------------------------------------------- */

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      setError("");

      try {
        const res = await fetch(`${API_BASE_URL}/deployments`);
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text);
        }

        const data = await res.json();
        if (mounted) {
          setDeployments(Array.isArray(data?.records) ? data.records : []);
        }
      } catch (err) {
        console.error("[deployments] load failed:", err);
        if (mounted) {
          setError("Unable to load deployment history.");
          setDeployments([]);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => (mounted = false);
  }, []);

  /* -------------------------------------------------------
     Trigger verification
  ------------------------------------------------------- */

  async function handleVerify(deploymentFile) {
    try {
      const res = await fetch(`${API_BASE_URL}/verify-contract`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deploymentFile }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text);
      }

      const reload = await fetch(`${API_BASE_URL}/deployments`);
      const data = await reload.json();
      setDeployments(Array.isArray(data?.records) ? data.records : []);
    } catch (err) {
      console.error("[verify] failed:", err);
      alert("Verification request failed.");
    }
  }

  /* -------------------------------------------------------
     Normalize backend records for UI
  ------------------------------------------------------- */

  const rows = useMemo(() => {
    return deployments.map((d) => {
      const network = safeString(d?.network);
      const explorerBase = getExplorerBaseUrl(network);

      const contractAddress = safeString(d?.contractAddress);
      const txHash = safeString(d?.txHash);

      return {
        file: d?.file,
        tokenName: safeString(d?.token?.tokenName || d?.tokenName),
        tokenType: safeString(d?.tokenType),
        network,
        contractAddress,
        txHash,
        deployedAt: d?.deployedAt || null,

        verificationStatus: safeString(d?.verificationStatus || "not_requested"),
        verificationMessage: safeString(d?.verificationMessage),
        etherscanUrl: safeString(d?.etherscanUrl),

        contractUrl:
          explorerBase && contractAddress
            ? `${explorerBase}/address/${contractAddress}`
            : null,

        txUrl:
          explorerBase && txHash
            ? `${explorerBase}/tx/${txHash}`
            : null,
      };
    });
  }, [deployments]);

  /* -------------------------------------------------------
     Render
  ------------------------------------------------------- */

  return (
    <div className="min-h-screen bg-gray-100 px-6 py-8">
      <div className="max-w-6xl mx-auto bg-white rounded shadow p-6">
        <div className="flex justify-between items-start gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Deployment History</h1>
            <p className="text-sm text-gray-600">
              This table represents a verifiable audit trail of smart contracts
              deployed through the ChainForge orchestration layer.
            </p>
          </div>

          <label className="text-sm text-gray-700 select-none">
            <input
              type="checkbox"
              className="mr-2"
              checked={privacyMode}
              onChange={(e) => setPrivacyMode(e.target.checked)}
            />
            Privacy Mode
          </label>
        </div>

        <div className="mt-6">
          {loading && <p className="text-gray-600">Loading deployments…</p>}
          {error && <p className="text-red-600">{error}</p>}

          {!loading && !error && rows.length === 0 && (
            <p className="text-gray-600">No deployments recorded yet.</p>
          )}

          {!loading && !error && rows.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3">Token</th>
                    <th className="text-left p-3">Type</th>
                    <th className="text-left p-3">Network</th>
                    <th className="text-left p-3">Contract</th>
                    <th className="text-left p-3">Transaction</th>
                    <th className="text-left p-3">Verification</th>
                    <th className="text-left p-3">Deployed At</th>
                  </tr>
                </thead>

                <tbody>
                  {rows.map((d, idx) => (
                    <tr key={idx} className="border-b hover:bg-gray-50">
                      <td className="p-3">{d.tokenName}</td>
                      <td className="p-3">{d.tokenType}</td>
                      <td className="p-3">{d.network}</td>

                      <td className="p-3">
                        {privacyMode ? (
                          <span className="text-gray-500">Hidden</span>
                        ) : d.contractUrl ? (
                          <a
                            href={d.contractUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-600 hover:underline"
                            title={d.contractAddress}
                          >
                            {shorten(d.contractAddress)}
                          </a>
                        ) : (
                          "-"
                        )}
                      </td>

                      <td className="p-3">
                        {privacyMode ? (
                          <span className="text-gray-500">Hidden</span>
                        ) : d.txUrl ? (
                          <a
                            href={d.txUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-600 hover:underline"
                            title={d.txHash}
                          >
                            {shorten(d.txHash)}
                          </a>
                        ) : (
                          "-"
                        )}
                      </td>

                      <td className="p-3">
                        {d.verificationStatus === "verified" && (
                          <a
                            href={d.etherscanUrl || d.contractUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-green-600 font-semibold hover:underline"
                          >
                            Verified
                          </a>
                        )}

                        {d.verificationStatus === "pending" && (
                          <span className="text-yellow-600 font-semibold">
                            Pending…
                          </span>
                        )}

                        {d.verificationStatus === "submitting" && (
                          <span className="text-blue-600 font-semibold">
                            Submitting…
                          </span>
                        )}

                        {d.verificationStatus === "retryable" && (
                          <button
                            onClick={() => handleVerify(d.file)}
                            className="text-orange-600 underline hover:text-orange-800"
                            title={d.verificationMessage}
                          >
                            Retry
                          </button>
                        )}

                        {d.verificationStatus === "failed" && (
                          <button
                            onClick={() => handleVerify(d.file)}
                            className="text-red-600 underline hover:text-red-800"
                            title={d.verificationMessage}
                          >
                            Failed — Retry
                          </button>
                        )}

                        {d.verificationStatus === "not_requested" && (
                          <button
                            onClick={() => handleVerify(d.file)}
                            className="text-blue-600 underline hover:text-blue-800"
                          >
                            Verify
                          </button>
                        )}
                      </td>

                      <td className="p-3">{formatDate(d.deployedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {!privacyMode && (
                <p className="text-xs text-gray-500 mt-3">
                  Explorer links are provided for independent public verification.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
