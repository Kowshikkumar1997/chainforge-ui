import React, { useState } from 'react';
import axios from 'axios';

function App() {
  // ---------- Token Type ----------
  const [tokenType, setTokenType] = useState('ERC20');

  // ---------- Token States ----------
  const [tokenName, setTokenName] = useState('');
  const [tokenSymbol, setTokenSymbol] = useState('');
  const [initialSupply, setInitialSupply] = useState('');
  const [decimals, setDecimals] = useState('');
  const [baseURI, setBaseURI] = useState('https://example.com/'); // for ERC1155 / metadata

  // ---------- Chain ----------
  const [chainName, setChainName] = useState('');
  const [consensus, setConsensus] = useState('Proof of Authority');

  // ---------- Module System ----------
  const [modules, setModules] = useState({
    governance: false,
    tokenTransfer: false,
    burnable: false,
    pausable: false,
    mintable: false,
    accessControl: false,
    ownable: false,
  });

  // ---------- Loading States ----------
  const [tokenLoading, setTokenLoading] = useState(false);
  const [chainLoading, setChainLoading] = useState(false);
  const [dynamicLoading, setDynamicLoading] = useState(false);

  // ---------- General Responses ----------
  const [response, setResponse] = useState('');
  const [tokenResult, setTokenResult] = useState(null);
  const [chainResult, setChainResult] = useState(null);

  // ---------- Dynamic Token States ----------
  const [dynamicTokenName, setDynamicTokenName] = useState('');
  const [dynamicTokenSymbol, setDynamicTokenSymbol] = useState('');
  const [dynamicInitialSupply, setDynamicInitialSupply] = useState('');
  const [dynamicResponse, setDynamicResponse] = useState('');

  // ---------- Wallet (MetaMask) ----------
  const [walletAddress, setWalletAddress] = useState(null);
  const [walletError, setWalletError] = useState('');

  // ---------- Activity Log (Mini Explorer) ----------
  const [activityLog, setActivityLog] = useState([]);

  const handleCheckboxChange = (e) => {
    setModules({ ...modules, [e.target.name]: e.target.checked });
  };

  // ============= CONNECT WALLET (METAMASK) =============
  const handleConnectWallet = async () => {
    if (!window.ethereum) {
      setWalletError('MetaMask not detected. Please install it to connect.');
      return;
    }
    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });
      setWalletAddress(accounts[0]);
      setWalletError('');
    } catch (err) {
      setWalletError('Wallet connection rejected.');
    }
  };

  // ============= DEPLOY DYNAMIC TOKEN =============
  const handleDynamicDeploy = async () => {
    if (!dynamicTokenName || !dynamicTokenSymbol || !dynamicInitialSupply) {
      alert('Please fill all dynamic token fields.');
      return;
    }

    setDynamicLoading(true);
    setDynamicResponse('');

    try {
      const res = await axios.post('http://localhost:4000/deploy-dynamic-token', {
        tokenName: dynamicTokenName,
        tokenSymbol: dynamicTokenSymbol,
        initialSupply: Number(dynamicInitialSupply),
      });

      if (res.data.success) {
        setDynamicResponse(`✅ Token deployed at: ${res.data.contractAddress}`);
        setActivityLog((prev) => [
          {
            type: 'dynamic-token',
            name: dynamicTokenName,
            contractAddress: res.data.contractAddress,
            time: new Date().toISOString(),
          },
          ...prev,
        ]);
      } else {
        setDynamicResponse('❌ Deployment failed');
      }
    } catch (err) {
      setDynamicResponse(`❌ Error: ${err.message}`);
    }

    setDynamicLoading(false);
  };

  // ============= SUBMIT TOKEN (ERC20 / ERC721 / ERC1155) =============
  const handleTokenSubmit = async () => {
    if (!tokenName.trim() || !tokenSymbol.trim()) {
      setResponse('Please fill in token name and symbol.');
      return;
    }

    if (tokenType === 'ERC20') {
      if (!initialSupply || Number(initialSupply) <= 0) {
        setResponse('ERC20: Initial Supply must be a positive number.');
        return;
      }
    }

    setResponse('');
    setTokenLoading(true);

    try {
      const selectedModules = Object.keys(modules).filter((mod) => modules[mod]);

      let payload = {
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
  payload.baseURI = "https://example.com/";
}


      const res = await axios.post('http://localhost:4000/create-token', payload);

      setTokenResult(res.data);
      setResponse(res.data.message || 'Token created successfully!');

      // ---- Add to Activity Log ----
      setActivityLog((prev) => [
        {
          type: 'token',
          tokenType,
          name: tokenName,
          contractAddress: res.data.contractAddress,
          time: new Date().toISOString(),
        },
        ...prev,
      ]);
    } catch (err) {
      console.error(err);
      setResponse('❌ Something went wrong. Please try again.');
      setTokenResult(null);
    }

    setTokenLoading(false);
  };

  // ============= SUBMIT CHAIN =============
  const handleChainSubmit = async () => {
    if (!chainName.trim()) {
      setResponse('Chain name is required.');
      return;
    }

    const selectedModules = Object.keys(modules).filter((m) => modules[m]);

    setChainLoading(true);
    setResponse('');

    try {
      const res = await axios.post('http://localhost:4000/create-chain', {
        chainName,
        consensusType: consensus,
        modules: selectedModules,
      });

      setResponse(res.data.message);
      setChainResult(res.data);

      // ---- Add to Activity Log ----
      setActivityLog((prev) => [
        {
          type: 'chain',
          name: chainName,
          path: res.data.path,
          time: new Date().toISOString(),
        },
        ...prev,
      ]);
    } catch (err) {
      setResponse('❌ Error: ' + err.message);
    }

    setChainLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="max-w-4xl w-full p-6 bg-white rounded shadow space-y-6">
        {/* ---------- HEADER + WALLET ---------- */}
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-3xl font-bold">ChainForge Studio</h1>
          <div className="text-right">
            {walletAddress ? (
              <div className="text-sm">
                <div className="font-semibold">Wallet Connected</div>
                <div className="truncate text-gray-600">
                  {walletAddress}
                </div>
              </div>
            ) : (
              <button
                onClick={handleConnectWallet}
                className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 text-sm"
              >
                Connect Wallet
              </button>
            )}
            {walletError && (
              <div className="text-xs text-red-500 mt-1">{walletError}</div>
            )}
          </div>
        </div>

        {/* ---------- CREATE TOKEN SECTION ---------- */}
        <div className="border rounded p-4 space-y-4">
          <h2 className="text-xl font-semibold mb-2">Create Token</h2>

          {/* Token Type */}
          <select
            className="w-full p-3 mb-2 border rounded"
            value={tokenType}
            onChange={(e) => setTokenType(e.target.value)}
          >
            <option value="ERC20">ERC20 — Fungible Token</option>
            <option value="ERC721">ERC721 — NFT</option>
            <option value="ERC1155">ERC1155 — Multi Token</option>
          </select>

          {/* Token Name / Symbol */}
          <input
            className="w-full p-3 mb-2 border rounded"
            placeholder="Token Name"
            value={tokenName}
            onChange={(e) => setTokenName(e.target.value)}
          />
          <input
            className="w-full p-3 mb-2 border rounded"
            placeholder="Token Symbol"
            value={tokenSymbol}
            onChange={(e) => setTokenSymbol(e.target.value)}
          />

          {/* ERC20-specific fields */}
          {tokenType === 'ERC20' && (
            <>
              <input
                className="w-full p-3 mb-2 border rounded"
                placeholder="Initial Supply"
                type="number"
                value={initialSupply}
                onChange={(e) => setInitialSupply(e.target.value)}
              />
              <input
                className="w-full p-3 mb-2 border rounded"
                placeholder="Decimals (default 18)"
                type="number"
                value={decimals}
                onChange={(e) => setDecimals(e.target.value)}
              />
            </>
          )}

          {/* ERC1155 / ERC721 base URI */}
          {(tokenType === 'ERC1155' || tokenType === 'ERC721') && (
            <input
              className="w-full p-3 mb-2 border rounded"
              placeholder="Base URI (for metadata)"
              value={baseURI}
              onChange={(e) => setBaseURI(e.target.value)}
            />
          )}

          {/* Modules */}
          <div className="mb-2 grid grid-cols-2 gap-3">
            {Object.keys(modules).map((mod) => (
              <label key={mod} className="inline-flex items-center text-sm">
                <input
                  type="checkbox"
                  name={mod}
                  checked={modules[mod]}
                  onChange={handleCheckboxChange}
                  className="form-checkbox"
                />
                <span className="ml-2 capitalize">{mod} Module</span>
              </label>
            ))}
          </div>

          {/* Create Token Button */}
          <button
            onClick={handleTokenSubmit}
            disabled={tokenLoading}
            className="w-full bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700"
          >
            {tokenLoading ? 'Creating Token...' : 'Create Token'}
          </button>

          {/* Token Response & Preview */}
          {response && (
            <p className="mt-2 text-center font-medium">{response}</p>
          )}

          {tokenResult && (
            <div className="mt-3 border rounded p-3 bg-gray-50 text-sm">
              <h3 className="font-semibold mb-1">Token Deployment</h3>
              <p><span className="font-semibold">Type:</span> {tokenType}</p>
              <p><span className="font-semibold">Name:</span> {tokenName}</p>
              <p><span className="font-semibold">Symbol:</span> {tokenSymbol}</p>
              <p>
                <span className="font-semibold">Contract Address:</span>{' '}
                {tokenResult.contractAddress || 'N/A'}
              </p>
              {tokenResult.download && (
                <a
                  href={`http://localhost:4000${tokenResult.download}`}
                  download
                  className="mt-2 inline-block bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                >
                  Download Token Files
                </a>
              )}
            </div>
          )}
        </div>

        {/* ---------- CREATE BLOCKCHAIN SECTION ---------- */}
        <div className="border rounded p-4 space-y-3">
          <h2 className="text-xl font-semibold mb-2">Create Blockchain</h2>

          <input
            className="w-full p-3 mb-2 border rounded"
            placeholder="Chain Name"
            value={chainName}
            onChange={(e) => setChainName(e.target.value)}
          />

          <select
            className="w-full p-3 mb-2 border rounded"
            value={consensus}
            onChange={(e) => setConsensus(e.target.value)}
          >
            <option value="Proof of Authority">Proof of Authority</option>
            <option value="Proof of Stake">Proof of Stake</option>
          </select>

          <button
            onClick={handleChainSubmit}
            disabled={chainLoading}
            className="w-full bg-green-600 text-white px-6 py-3 rounded hover:bg-green-700"
          >
            {chainLoading ? 'Creating Chain...' : 'Create Blockchain'}
          </button>

          {chainResult && (
            <div className="mt-3 border rounded p-3 bg-gray-50 text-sm">
              <h3 className="font-semibold mb-1">Chain Scaffolded</h3>
              <p><span className="font-semibold">Name:</span> {chainName}</p>
              <p><span className="font-semibold">Consensus:</span> {consensus}</p>
              <p><span className="font-semibold">Path:</span> {chainResult.path}</p>
              {chainResult.download && (
                <a
                  href={`http://localhost:4000${chainResult.download}`}
                  download
                  className="mt-2 inline-block bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                >
                  Download Chain Files
                </a>
              )}
            </div>
          )}
        </div>

        {/* ---------- ACTIVITY LOG (Mini Explorer) ---------- */}
        <div className="border rounded p-4">
          <h2 className="text-xl font-semibold mb-2">Activity Log</h2>
          {activityLog.length === 0 ? (
            <p className="text-sm text-gray-500">No activity yet.</p>
          ) : (
            <ul className="space-y-2 text-sm max-h-40 overflow-y-auto">
              {activityLog.map((item, idx) => (
                <li key={idx} className="border-b pb-1">
                  <div className="font-semibold">
                    {item.type === 'token' && `Token: ${item.name} (${item.tokenType})`}
                    {item.type === 'chain' && `Chain: ${item.name}`}
                    {item.type === 'dynamic-token' && `Dynamic Token: ${item.name}`}
                  </div>
                  {item.contractAddress && (
                    <div>Address: {item.contractAddress}</div>
                  )}
                  {item.path && <div>Path: {item.path}</div>}
                  <div className="text-xs text-gray-500">
                    {new Date(item.time).toLocaleString()}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* ---------- DYNAMIC TOKEN DEPLOYMENT ---------- */}
        <div className="border rounded p-4">
          <h2 className="text-xl font-semibold mb-2">Deploy Dynamic Token</h2>

          <input
            className="w-full p-3 mb-2 border rounded"
            placeholder="Token Name"
            value={dynamicTokenName}
            onChange={(e) => setDynamicTokenName(e.target.value)}
          />
          <input
            className="w-full p-3 mb-2 border rounded"
            placeholder="Token Symbol"
            value={dynamicTokenSymbol}
            onChange={(e) => setDynamicTokenSymbol(e.target.value)}
          />
          <input
            className="w-full p-3 mb-2 border rounded"
            placeholder="Initial Supply"
            type="number"
            value={dynamicInitialSupply}
            onChange={(e) => setDynamicInitialSupply(e.target.value)}
          />

          <button
            onClick={handleDynamicDeploy}
            disabled={dynamicLoading}
            className="w-full bg-purple-600 text-white py-3 rounded hover:bg-purple-700"
          >
            {dynamicLoading ? 'Deploying...' : 'Deploy Dynamic Token'}
          </button>

          {dynamicResponse && (
            <p className="mt-2 text-center font-medium">{dynamicResponse}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
