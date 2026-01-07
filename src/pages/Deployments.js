import React, { useEffect, useMemo, useState } from "react";
import { API_BASE_URL } from "../config";

/**
 * ChainForge — Deployment History
 *
 * This page renders an immutable audit trail of contracts deployed via the ChainForge backend.
 *
 * Notes:
 * - Deployments are public blockchain events. However, the UI may optionally redact identifiers
 *   (contract address / transaction hash) when the platform is operated without user accounts.
 * - Explorer links are derived from the recorded network field to avoid hardcoding environment details.
 */

function shorten(value) {
  if (!value || typeof value !== "string") return "-";
  if (value.length <= 12) return value;
  return `${value.slice(0, 6)}…${value.slice(-4)}`;
}

function safeString(value) {
  if (value === null || value === undefined) return "-";
  if (typeof value === "string" && value.trim().length === 0) return "-";
  return String(value);
}

function getExplorerBaseUrl(network) {
  const key = (network || "").toLowerCase();

  // Extend safely as networks are added.
  // Keep mappings explicit (avoid guessing URLs for unknown networks).
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

  // Default to privacy-on when there is no per-user access control.
  const [privacyMode, setPrivacyMode] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadDeployments() {
      setLoading(true);
      setError("");

      try {
        const res = await fetch(`${API_BASE_URL}/deployments`);

        if (!res.ok) {
          const text = await res.text();
          throw new Error(`HTTP ${res.status}: ${text}`);
        }

        const data = await res.json();
        const list = Array.isArray(data?.records) ? data.records : [];

        if (isMounted) {
          setDeployments(list);
        }
      } catch (err) {
        console.error("[deployments] load failed:", err);
        if (isMounted) {
          setError("Unable to load deployment history.");
          setDeployments([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadDeployments();

    return () => {
      isMounted = false;
    };
  }, []);

  const rows = useMemo(() => {
    // Defensive normalization so the UI does not break if a field is missing.
    return deployments.map((d) => {
      const network = safeString(d?.network);
      const explorerBase = getExplorerBaseUrl(network);

      const contractAddress = d?.contractAddress || "";
      const txHash = d?.txHash || "";

      const contractUrl =
        explorerBase && contractAddress
          ? `${explorerBase}/address/${contractAddress}`
          : null;

      const txUrl =
        explorerBase && txHash ? `${explorerBase}/tx/${txHash}` : null;

      return {
        tokenName: safeString(d?.tokenName),
        tokenType: safeString(d?.tokenType),
        network,
        contractAddress,
        txHash,
        verified: Boolean(d?.verified),
        deployedAt: d?.deployedAt || null,
        contractUrl,
        txUrl,
      };
    });
  }, [deployments]);

  return (
    <div className="min-h-screen bg-gray-100 px-6 py-8">
      <div className="max-w-6xl mx-auto bg-white rounded shadow p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Deployment History</h1>
            <p className="text-sm text-gray-600">
              This page provides a verifiable record of contracts deployed through
              ChainForge. When enabled, Privacy Mode redacts identifiers from the UI
              while preserving the audit log semantics.
            </p>
          </div>

          <div className="flex items-center gap-2">
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
                    <th className="text-left p-3">Verified</th>
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
                          <span className="text-gray-500">-</span>
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
                          <span className="text-gray-500">-</span>
                        )}
                      </td>

                      <td className="p-3">
                        {d.verified ? "Verified" : "Unverified"}
                      </td>

                      <td className="p-3">{formatDate(d.deployedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {!privacyMode && (
                <p className="text-xs text-gray-500 mt-3">
                  Explorer links are provided for independent verification. Contract
                  identifiers are public by nature; Privacy Mode only affects UI display.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
