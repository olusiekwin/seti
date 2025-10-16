import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { ConnectButton } from '@rainbow-me/rainbowkit';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WalletModal({ isOpen, onClose }: WalletModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4 min-h-screen">
      <div className="bg-background rounded-lg shadow-xl max-w-md w-full mx-auto my-auto max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gradient-gold font-orbitron">
              Connect Wallet
            </h2>
            <Button variant="ghost" size="sm" onClick={onClose} className="hover:bg-[hsl(208,65%,75%)] hover:text-background">
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="flex flex-col items-center justify-center py-6">
            <div className="w-full mb-6 flex justify-center">
              <ConnectButton.Custom>
                {({
                  account,
                  chain,
                  openAccountModal,
                  openChainModal,
                  openConnectModal,
                  authenticationStatus,
                  mounted,
                }) => {
                  const ready = mounted && authenticationStatus !== 'loading';
                  const connected =
                    ready &&
                    account &&
                    chain &&
                    (!authenticationStatus ||
                      authenticationStatus === 'authenticated');

                  if (!connected) {
                    return (
                      <div className="w-full flex flex-col gap-4">
                        <Button 
                          onClick={openConnectModal}
                          className="w-full h-16 bg-[hsl(208,65%,75%)] hover:bg-[hsl(208,65%,85%)] text-background transition-all duration-200 hover:scale-105"
                        >
                          Connect Wallet
                        </Button>
                        <p className="text-sm text-center text-muted-foreground">
                          Connect your wallet to access Seti's features.
                        </p>
                      </div>
                    );
                  }

                  return (
                    <div className="w-full flex flex-col gap-4">
                      <div className="flex flex-col items-center gap-3 p-4 border rounded-lg">
                        <div className="flex items-center gap-2">
                          <Button
                            onClick={openChainModal}
                            variant="outline"
                            className="text-sm"
                          >
                            {chain.name}
                          </Button>
                          <Button
                            onClick={openAccountModal}
                            variant="outline"
                            className="text-sm"
                          >
                            {account.displayName}
                          </Button>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Connected successfully
                        </p>
                      </div>
                    </div>
                  );
                }}
              </ConnectButton.Custom>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-border/20">
            <Button
              variant="outline"
              onClick={onClose}
              className="w-full transition-all duration-200 hover:scale-105"
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
