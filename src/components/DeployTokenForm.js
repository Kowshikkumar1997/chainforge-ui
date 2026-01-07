import React, { useState } from "react";
import { API_BASE_URL } from "../config";
import DeployTokenForm from "../components/DeployTokenForm";

/**
 * DeployTokenForm
 *
 * Unified deployment form for ERC20, ERC721, and ERC1155 contracts.
 * Allows users to select token standard, configure parameters,
 * and enable optional feature modules.
 *
 * This component is intentionally explicit and declarative to
 * preserve auditability and reduce deployment ambiguity.
 */

export default function DeployTokenForm() {
  const [type, setType] = useState("ERC20");
  const [tokenName, setTokenName] = useState("");
  const [tokenSymbol, setTokenSymbol] = useState("");
  const [initialSupply, setInitialSupply] = useState("");
  const [decimals, setDecimals] = useState("18");
  const [baseURI, setBaseURI] = useState("");
  const [modules, setModules] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function toggleModule(module) {
    setModules((prev) =>
      prev.includes(module)
        ? prev.filter((m) => m !== module)
        : [...prev, module]
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const payload = {
        type,
        tokenName,
        tokenSymbol: type !== "ERC1155" ? tokenSymbol : undefined,
        initialSupply: type === "ERC20" ? initialSupply : undefined,
        decimals: type === "ERC20" ? decimals : undefined,
        baseURI: type === "ERC1155" ? baseURI : undefined,
        modules,
      };

      const res = await fetch(`${API_BASE_URL}/create-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Deployment failed");

      setSuccess("Deployment job submitted successfully.");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-xl font-semibold">Deploy Token</h2>

      {/* Token Type */}
      <div>
        <label className="block text-sm font-medium">Token Standard</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="mt-1 w-full border rounded px-3 py-2"
        >
          <option value="ERC20">ERC20</option>
          <option value="ERC721">ERC721</option>
          <option value="ERC1155">ERC1155</option>
        </select>
      </div>

      {/* Token Name */}
      <div>
        <label className="block text-sm font-medium">Token Name</label>
        <input
          value={tokenName}
          onChange={(e) => setTokenName(e.target.value)}
          className="mt-1 w-full border rounded px-3 py-2"
          required
        />
      </div>

      {/* ERC20 / ERC721 */}
      {type !== "ERC1155" && (
        <div>
          <label className="block text-sm font-medium">Token Symbol</label>
          <input
            value={tokenSymbol}
            onChange={(e) => setTokenSymbol(e.target.value)}
            className="mt-1 w-full border rounded px-3 py-2"
            required
          />
        </div>
      )}

      {/* ERC20 */}
      {type === "ERC20" && (
        <>
          <div>
            <label className="block text-sm font-medium">Initial Supply</label>
            <input
              value={initialSupply}
              onChange={(e) => setInitialSupply(e.target.value)}
              className="mt-1 w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Decimals</label>
            <input
              value={decimals}
              onChange={(e) => setDecimals(e.target.value)}
              className="mt-1 w-full border rounded px-3 py-2"
            />
          </div>
        </>
      )}

      {/* ERC1155 */}
      {type === "ERC1155" && (
        <div>
          <label className="block text-sm font-medium">Base URI</label>
          <input
            value={baseURI}
            onChange={(e) => setBaseURI(e.target.value)}
            className="mt-1 w-full border rounded px-3 py-2"
            required
          />
        </div>
      )}

      {/* Modules */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Optional Modules
        </label>

        {["mintable", "burnable", "pausable"].map((m) => (
          <label key={m} className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={modules.includes(m)}
              onChange={() => toggleModule(m)}
            />
            <span className="capitalize">{m}</span>
          </label>
        ))}
      </div>

      {/* Status */}
      {error && <p className="text-red-600 text-sm">{error}</p>}
      {success && <p className="text-green-600 text-sm">{success}</p>}

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {loading ? "Submitting…" : "Deploy Token"}
      </button>
    </form>
  );
}
