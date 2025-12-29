import React, { useEffect, useState } from "react";

/**
 * Deployment History
 *
 * Displays an immutable audit trail of all smart contracts
 * deployed via the ChainForge platform.
 *
 * Each entry links directly to public blockchain explorers
 * to allow independent verification.
 */

const API_BASE_URL = "http://localhost:4000";

function shorten(value) {
  if (!value) return "-";
  return `${value.slice(0, 6)}…${value.slice(-4)}`;
}

export default function Deployments() {
  const [deployments, setDeployments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDeployments() {
      try {
        const res = await fetch(`${API_BASE_URL}/deployments`);
        const data = await res.json();
        setDeployments(data.deployments || []);
      } catch (err) {
        console.error(err);
        setError("Unable to load deployment history.");
      } finally {
        setLoading(false);
      }
    }

    loadDeployments();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 px-6 py-8">
      <div className="max-w-6xl mx-auto bg-white rounded shadow p-6">
        <h1 className="text-3xl font-bold mb-2">Deployment History</h1>

        <p className="text-sm text-gray-600 mb-6">
          This page provides a verifiable record of all smart contracts deployed
          through ChainForge. Each deployment can be independently validated via
          public blockchain explorers.
        </p>

        {loading && <p className="text-gray-600">Loading deployments…</p>}

        {error && <p className="text-red-600">{error}</p>}

        {!loading && !error && deployments.length === 0 && (
          <p className="text-gray-600">No deployments recorded yet.</p>
        )}

        {!loading && !error && deployments.length > 0 && (
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
                {deployments.map((d, idx) => (
                  <tr key={idx} className="border-b hover:bg-gray-50">
                    <td className="p-3">{d.tokenName}</td>
                    <td className="p-3">{d.tokenType}</td>
                    <td className="p-3">{d.network}</td>

                    <td className="p-3">
                      <a
                        href={`https://sepolia.etherscan.io/address/${d.contractAddress}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {shorten(d.contractAddress)}
                      </a>
                    </td>

                    <td className="p-3">
                      {d.txHash ? (
                        <a
                          href={`https://sepolia.etherscan.io/tx/${d.txHash}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {shorten(d.txHash)}
                        </a>
                      ) : (
                        "-"
                      )}
                    </td>

                    <td className="p-3">
                      {d.verified ? "Verified" : "Unverified"}
                    </td>

                    <td className="p-3">
                      {d.deployedAt
                        ? new Date(d.deployedAt).toLocaleString()
                        : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}