import React, { useState } from 'react';
import axios from 'axios';

const TokenForm = () => {
  const [type, setType] = useState('ERC20');
  const [name, setName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [initialSupply, setInitialSupply] = useState(1000);
  const [baseURI, setBaseURI] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        type,
        name,
        symbol,
        initialSupply,
        baseURI,
      };
      const res = await axios.post('http://localhost:4000/create-token', payload);
      setMessage(res.data.message + '\n' + res.data.stdout);
    } catch (err) {
      setMessage(err.response?.data?.error || err.message);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4 bg-white rounded-xl shadow">
      <h1 className="text-2xl font-bold mb-4">Generate Your Token</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <label>
          Token Type:
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full border px-4 py-2 rounded"
          >
            <option value="ERC20">ERC20</option>
            <option value="ERC721">ERC721</option>
            <option value="ERC1155">ERC1155</option>
          </select>
        </label>

        {(type === 'ERC20' || type === 'ERC721') && (
          <>
            <input
              type="text"
              placeholder="Token Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border px-4 py-2 rounded"
              required
            />
            <input
              type="text"
              placeholder="Token Symbol (e.g., LAB)"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              className="w-full border px-4 py-2 rounded"
              required
            />
          </>
        )}

        {type === 'ERC20' && (
          <input
            type="number"
            placeholder="Initial Supply"
            value={initialSupply}
            onChange={(e) => setInitialSupply(parseInt(e.target.value))}
            className="w-full border px-4 py-2 rounded"
            required
          />
        )}

        {type === 'ERC1155' && (
          <input
            type="text"
            placeholder="Base URI for Metadata"
            value={baseURI}
            onChange={(e) => setBaseURI(e.target.value)}
            className="w-full border px-4 py-2 rounded"
            required
          />
        )}

        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        >
          Generate Token
        </button>
      </form>

      {message && <pre className="mt-4 bg-gray-100 p-2 rounded">{message}</pre>}
    </div>
  );
};

export default TokenForm;
