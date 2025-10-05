import { useState } from 'react';
import { Market } from '@/types/contract';
import { PredictionModal } from '@/components/PredictionModal';

export function usePredictionModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedMarket, setSelectedMarket] = useState<Market | null>(null);
  const [selectedOutcome, setSelectedOutcome] = useState<'YES' | 'NO' | null>(null);

  const openModal = (market: Market, outcome: 'YES' | 'NO') => {
    setSelectedMarket(market);
    setSelectedOutcome(outcome);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setSelectedMarket(null);
    setSelectedOutcome(null);
  };

  const ModalComponent = () => {
    if (!isOpen || !selectedMarket || !selectedOutcome) {
      return null;
    }

    return (
      <PredictionModal
        isOpen={isOpen}
        onClose={closeModal}
        market={selectedMarket}
        outcome={selectedOutcome}
      />
    );
  };

  return {
    openModal,
    closeModal,
    ModalComponent,
    isOpen,
    selectedMarket,
    selectedOutcome,
  };
}