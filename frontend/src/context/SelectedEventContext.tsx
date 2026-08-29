/**
 * frontend/src/context/SelectedEventContext.tsx
 * SkyGuard AI — Selected Event Context.
 * Persists the currently-selected anomaly event across Analysis views
 * (Event Forensics, XAI Reasoner), solving the 3-click re-selection problem.
 */

import React, { createContext, useContext, useState, useCallback } from 'react';

interface SelectedEventState {
  /** Currently selected anomaly event ID */
  selectedEventId: number | null;
  /** Station ID associated with the selected event */
  selectedEventStationId: string | null;
}

interface SelectedEventContextType extends SelectedEventState {
  /** Select an event (from Alert Center or any other source) */
  selectEvent: (eventId: number, stationId?: string) => void;
  /** Clear the selected event */
  clearSelectedEvent: () => void;
}

const SelectedEventContext = createContext<SelectedEventContextType | undefined>(undefined);

export const SelectedEventProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<SelectedEventState>({
    selectedEventId: null,
    selectedEventStationId: null,
  });

  const selectEvent = useCallback((eventId: number, stationId?: string) => {
    setState({
      selectedEventId: eventId,
      selectedEventStationId: stationId || null,
    });
  }, []);

  const clearSelectedEvent = useCallback(() => {
    setState({
      selectedEventId: null,
      selectedEventStationId: null,
    });
  }, []);

  return (
    <SelectedEventContext.Provider
      value={{
        ...state,
        selectEvent,
        clearSelectedEvent,
      }}
    >
      {children}
    </SelectedEventContext.Provider>
  );
};

export const useSelectedEvent = () => {
  const context = useContext(SelectedEventContext);
  if (!context) {
    throw new Error('useSelectedEvent must be used within a SelectedEventProvider');
  }
  return context;
};
