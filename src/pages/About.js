import React from "react";

/**
 * ---------------------------------------------------------------------
 * ChainForge — About
 * ---------------------------------------------------------------------
 *
 * This page describes the purpose, architecture, and capabilities of
 * the ChainForge blockchain infrastructure platform.
 *
 * The content is written for technical, audit, and compliance clarity.
 */

export default function About() {
  return (
    <div className="min-h-screen bg-gray-100 px-6 py-10">
      <div className="max-w-5xl mx-auto bg-white rounded shadow p-8 space-y-6">

        <header>
          <h1 className="text-3xl font-bold mb-2">About ChainForge</h1>
          <p className="text-gray-600 text-sm">
            Backend-first blockchain infrastructure for deterministic smart contract deployment.
          </p>
        </header>

        <section className="space-y-3 text-gray-700 text-sm leading-relaxed">
          <p>
            ChainForge is a backend blockchain infrastructure platform designed to provide
            deterministic, auditable, and reproducible smart contract deployment workflows.
          </p>

          <p>
            The platform abstracts complex Solidity generation, compilation, deployment, and
            verification processes into a controlled backend orchestration layer. This ensures that
            every deployed contract follows a consistent, traceable, and verifiable lifecycle.
          </p>

          <p>
            ChainForge is built for engineers, teams, and organizations that require operational
            correctness, transparency, and long-term auditability in blockchain deployments.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">Core Principles</h2>
          <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
            <li>Deterministic contract generation</li>
            <li>Backend-controlled execution</li>
            <li>Audit traceability</li>
            <li>Compiler-accurate verification</li>
            <li>Separation of frontend and blockchain execution concerns</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">Current Capabilities</h2>
          <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
            <li>ERC20, ERC721, and ERC1155 contract deployment</li>
            <li>Feature composition (mintable, burnable, pausable, governance)</li>
            <li>Deterministic artifact-based deployment</li>
            <li>Automatic Etherscan verification</li>
            <li>Deployment record persistence</li>
            <li>Audit bundle generation</li>
            <li>Blockchain project scaffold generation</li>
            <li>Contract interaction through backend APIs</li>
            <li>Wallet identity association</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">Deployment Architecture</h2>
          <ol className="list-decimal list-inside text-sm text-gray-700 space-y-1">
            <li>Contracts are generated from controlled templates</li>
            <li>Compilation occurs only during build time</li>
            <li>Production uses only precompiled artifacts</li>
            <li>Deployments are executed exclusively by the backend</li>
            <li>User wallets provide identity and visibility</li>
            <li>Verification uses compiler-accurate payloads</li>
            <li>Deployment records are persisted for auditability</li>
          </ol>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">Wallet Integration</h2>
          <p className="text-sm text-gray-700 leading-relaxed">
            User wallets are connected for identity association and visibility. Deployed contracts
            appear automatically in the user’s wallet. Wallets are not used to execute deployment
            transactions. All blockchain transactions are executed by the platform’s controlled
            infrastructure layer.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">Network Support</h2>
          <p className="text-sm text-gray-700 leading-relaxed">
            ChainForge currently operates on test networks for validation and development purposes.
            The platform architecture is designed to support additional networks, including mainnet
            environments, through controlled configuration expansion.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">Roadmap Direction</h2>
          <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
            <li>Multi-network deployment support</li>
            <li>Role-based access control</li>
            <li>Deployment environment profiles</li>
            <li>Advanced audit exports</li>
            <li>Organization-level deployment management</li>
          </ul>
        </section>

        <section className="border-t pt-4 text-xs text-gray-500">
          ChainForge is an infrastructure and developer tooling platform. It does not provide
          financial, investment, or advisory services.
        </section>

      </div>
    </div>
  );
}
