import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface WalletContextType {
  isConnected: boolean;
  address: string | null;
  balance: string;
  connect: () => Promise<void>;
  disconnect: () => void;
  chainId: number | null;
  switchToBase: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

interface ChainlinkWalletProviderProps {
  children: ReactNode;
}

export function ChainlinkWalletProvider({ children }: ChainlinkWalletProviderProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState('0');
  const [chainId, setChainId] = useState<number | null>(null);

  // Check if wallet is already connected
  useEffect(() => {
    const checkConnection = async () => {
      if (typeof window.ethereum !== 'undefined') {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            setAddress(accounts[0]);
            setIsConnected(true);
            await getBalance(accounts[0]);
            await getChainId();
          }
        } catch (error) {
          console.error('Error checking wallet connection:', error);
        }
      }
    };

    checkConnection();
  }, []);

  const getBalance = async (walletAddress: string) => {
    try {
      if (typeof window.ethereum !== 'undefined') {
        const balance = await window.ethereum.request({
          method: 'eth_getBalance',
          params: [walletAddress, 'latest'],
        });
        // Convert from wei to ETH
        const ethBalance = (parseInt(balance, 16) / Math.pow(10, 18)).toFixed(4);
        setBalance(ethBalance);
      }
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  };

  const getChainId = async () => {
    try {
      if (typeof window.ethereum !== 'undefined') {
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        setChainId(parseInt(chainId, 16));
      }
    } catch (error) {
      console.error('Error fetching chain ID:', error);
    }
  };

  const connect = async () => {
    try {
      if (typeof window.ethereum === 'undefined') {
        alert('Please install MetaMask or another Ethereum wallet to continue.');
        return;
      }

      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length > 0) {
        setAddress(accounts[0]);
        setIsConnected(true);
        await getBalance(accounts[0]);
        await getChainId();
        
        // Listen for account changes
        window.ethereum.on('accountsChanged', (newAccounts: string[]) => {
          if (newAccounts.length > 0) {
            setAddress(newAccounts[0]);
            getBalance(newAccounts[0]);
          } else {
            disconnect();
          }
        });

        // Listen for chain changes
        window.ethereum.on('chainChanged', (newChainId: string) => {
          setChainId(parseInt(newChainId, 16));
          if (isConnected && address) {
            getBalance(address);
          }
        });
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      if (error.code === 4001) {
        alert('Please connect your wallet to continue.');
      }
    }
  };

  const disconnect = () => {
    setIsConnected(false);
    setAddress(null);
    setBalance('0');
    setChainId(null);
  };

  const switchToBase = async () => {
    try {
      if (typeof window.ethereum !== 'undefined') {
        // Base mainnet chain ID is 8453
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x2105' }], // 8453 in hex
        });
      }
    } catch (error) {
      // If the chain doesn't exist, add it
      if (error.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: '0x2105',
                chainName: 'Base',
                nativeCurrency: {
                  name: 'Ether',
                  symbol: 'ETH',
                  decimals: 18,
                },
                rpcUrls: ['https://mainnet.base.org'],
                blockExplorerUrls: ['https://basescan.org'],
              },
            ],
          });
        } catch (addError) {
          console.error('Error adding Base network:', addError);
        }
      } else {
        console.error('Error switching to Base network:', error);
      }
    }
  };

  const value: WalletContextType = {
    isConnected,
    address,
    balance,
    connect,
    disconnect,
    chainId,
    switchToBase,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}

export function useChainlinkWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useChainlinkWallet must be used within a ChainlinkWalletProvider');
  }
  return context;
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, callback: (...args: any[]) => void) => void;
      removeListener: (event: string, callback: (...args: any[]) => void) => void;
    };
  }
}
