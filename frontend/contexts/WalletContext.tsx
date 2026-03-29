"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  isAllowed,
  isConnected,
  requestAccess,
  getNetworkDetails,
  getAddress,
} from "@stellar/freighter-api";
import { toast } from "sonner";

interface WalletContextType {
  address: string | null;
  isConnecting: boolean;
  network: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [network, setNetwork] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    // Check if the user is already authorized so we can silently log them in on refresh
    const checkConnection = async () => {
      try {
        const connectionResult = await isConnected();
        if (connectionResult.isConnected) {
          const allowedResult = await isAllowed();
          if (allowedResult.isAllowed) {
            const addrResult = await getAddress();
            if (!addrResult.error && addrResult.address) {
              setAddress(addrResult.address);
              const netResult = await getNetworkDetails();
              if (!netResult.error) {
                setNetwork(netResult.network);
              }
            }
          }
        }
      } catch (e) {
        console.error("Error checking Freighter connection", e);
      }
    };
    checkConnection();
  }, []);

  const connect = async () => {
    setIsConnecting(true);
    try {
      const connectionResult = await isConnected();

      if (!connectionResult.isConnected) {
        toast.error("Wallet not found", {
          description: "You need the Freighter wallet extension to continue.",
          action: {
            label: "Install Freighter",
            onClick: () => window.open("https://www.freighter.app/", "_blank"),
          },
          duration: 10000,
        });
        setIsConnecting(false);
        return;
      }

      // requestAccess prompts the user to authorize the app
      const accessResult = await requestAccess();
      if (accessResult.error) {
        toast.error("Connection declined", {
          description: "You cancelled the wallet connection.",
        });
        return;
      }

      const addrResult = await getAddress();
      if (addrResult.error || !addrResult.address) {
        toast.error("Could not retrieve address", {
          description: "Please try reconnecting your wallet.",
        });
        return;
      }

      setAddress(addrResult.address);

      // Check network
      const netResult = await getNetworkDetails();
      if (!netResult.error) {
        setNetwork(netResult.network);
        if (netResult.network !== "TESTNET") {
          toast.warning("Wrong network detected", {
            description:
              "Please switch your Freighter wallet to Testnet to interact with FundStar.",
          });
        } else {
          toast.success("Wallet connected!", {
            description: `Connected to ${addrResult.address.slice(0, 6)}...${addrResult.address.slice(-4)}`,
          });
        }
      }
    } catch (error: unknown) {
      console.error("Failed to connect wallet:", error);
      toast.error("Failed to connect", {
        description: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = () => {
    setAddress(null);
    setNetwork(null);
    toast.info("Wallet disconnected");
  };

  return (
    <WalletContext.Provider value={{ address, isConnecting, network, connect, disconnect }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
}
