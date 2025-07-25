"use client";

import Image from "next/image";
import { useAccount, useConnect, useDisconnect, useSendCalls } from "wagmi";
import { getCallsStatus } from "@wagmi/core";
import { metaMask } from "wagmi/connectors";
import { parseEther } from "viem";
import { wagmiConfig as config } from "@/providers/AppProvider";
import { useState } from "react";

export default function Home() {
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const { sendCalls, error, isPending, isSuccess, data, reset } =
    useSendCalls();

  const { address, isConnected } = useAccount();
  const [transactionHash, setTransactionHash] = useState<string | null>(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);

  const handleSendTransaction = () => {
    if (!isConnected) return;

    // Reset previous states
    setTransactionHash(null);
    setStatusError(null);
    reset();

    sendCalls({
      calls: [
        {
          to: "0x364CAa7b19Ac08f066C07209741c5e17A4f98eE1",
          value: parseEther("0.001"),
        },
        {
          to: "0x364CAa7b19Ac08f066C07209741c5e17A4f98eE1",
          value: parseEther("0.0001"),
        },
      ],
    });
  };

  const handleGetCallsStatus = async () => {
    if (!data?.id) return;

    setStatusLoading(true);
    setStatusError(null);

    try {
      const status = await getCallsStatus(config, { id: data.id });
      console.log("Transaction status:", status);

      if (
        status.status === "success" &&
        status.receipts?.[0]?.transactionHash
      ) {
        setTransactionHash(status.receipts[0].transactionHash);
      } else if (status.status === "failure") {
        setStatusError("Transaction failed");
      }
    } catch (err) {
      console.error("Error getting call status:", err);
      setStatusError(
        err instanceof Error ? err.message : "Failed to get transaction status"
      );
    } finally {
      setStatusLoading(false);
    }
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start max-w-2xl">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={180}
          height={38}
          priority
        />

        <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg w-full">
          <h2 className="text-xl font-semibold mb-4">Wallet Connection</h2>

          {/* Connection Status */}
          <div className="mb-6">
            {isConnected ? (
              <div className="flex items-center gap-2 text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Connected to {formatAddress(address!)}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-red-600">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span>Not connected</span>
              </div>
            )}
          </div>

          {/* Connect/Disconnect Button */}
          <button
            className={`w-full rounded-lg border border-solid px-6 py-3 font-medium transition-colors ${
              isConnected
                ? "bg-red-50 hover:bg-red-100 text-red-700 border-red-300 cursor-pointer"
                : "bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-300 cursor-pointer"
            }`}
            onClick={() => {
              if (isConnected) {
                disconnect();
                setTransactionHash(null);
                setStatusError(null);
                reset();
              } else {
                connect({ connector: metaMask() });
              }
            }}
          >
            {isConnected ? "Disconnect Wallet" : "Connect with MetaMask"}
          </button>
        </div>

        {/* Transaction Section */}
        <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg w-full">
          <h2 className="text-xl font-semibold mb-4">Send Batch Transaction</h2>

          <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
            <p>This will send 2 transactions:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>0.001 ETH to 0x364C...8eE1</li>
              <li>0.0001 ETH to 0x364C...8eE1</li>
            </ul>
          </div>

          <button
            className={`w-full rounded-lg border border-solid px-6 py-3 font-medium transition-colors mb-4 ${
              !isConnected || isPending
                ? "bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed"
                : "bg-green-50 hover:bg-green-100 text-green-700 border-green-300 cursor-pointer"
            }`}
            onClick={handleSendTransaction}
            disabled={!isConnected || isPending}
          >
            {isPending ? "Sending Transaction..." : "Send Batch Transaction"}
          </button>

          {/* Transaction Status */}
          {isPending && (
            <div className="flex items-center gap-2 text-blue-600 mb-4">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span>Transaction pending...</span>
            </div>
          )}

          {isSuccess && data && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2 text-green-700 mb-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="font-medium">
                  Transaction submitted successfully!
                </span>
              </div>
              <div className="text-sm text-gray-600">
                <p>
                  Data ID:{" "}
                  <code className="bg-gray-100 px-1 rounded">{data.id}</code>
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <div className="text-red-700 font-medium">Transaction Error</div>
              <div className="text-sm text-red-600 mt-1">{error.message}</div>
            </div>
          )}

          {/* Get Status Button */}
          {data && (
            <button
              className={`w-full rounded-lg border border-solid px-6 py-3 font-medium transition-colors ${
                statusLoading
                  ? "bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed"
                  : "bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-300 cursor-pointer"
              }`}
              onClick={handleGetCallsStatus}
              disabled={statusLoading || !data.id}
            >
              {statusLoading
                ? "Checking Status..."
                : "Check Transaction Status"}
            </button>
          )}

          {/* Status Error */}
          {statusError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
              <div className="text-red-700 font-medium">Status Check Error</div>
              <div className="text-sm text-red-600 mt-1">{statusError}</div>
            </div>
          )}

          {/* Transaction Hash */}
          {transactionHash && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
              <div className="text-blue-700 font-medium mb-2">
                Transaction Confirmed!
              </div>
              <div className="text-sm">
                <a
                  href={`https://sepolia.etherscan.io/tx/${transactionHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 hover:underline break-all"
                >
                  View on Etherscan: {transactionHash}
                </a>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4 text-sm"
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/file.svg"
            alt="File icon"
            width={16}
            height={16}
          />
          Learn
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4 text-sm"
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/window.svg"
            alt="Window icon"
            width={16}
            height={16}
          />
          Examples
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4 text-sm"
          href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          Go to nextjs.org →
        </a>
      </footer>
    </div>
  );
}
