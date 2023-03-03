import { useRouter } from 'next/router';
import React, { useCallback, useReducer, useState } from 'react';

const ItinerariesContext = React.createContext({});

export default ItinerariesContext;

function itinerariesReducer(state, action) {
  switch (action.type) {
    case 'addItineraries': {
      const newItineraries = [...state];
      action.itineraries.forEach((itinerary) => {
        const exists = newItineraries.find((p) => p._id === itinerary._id);
        if (!exists) {
          newItineraries.push(itinerary);
        }
      });
      return newItineraries;
    }
    case 'deleteItinerary': {
      const newItineraries = [];
      state.forEach((itinerary) => {
        if (itinerary._id !== action.itineraryId) {
          newItineraries.push(itinerary);
        }
      });
      return newItineraries;
    }
    default:
      return state;
  }
}

export const ItinerariesProvider = ({ children }) => {
  const [itineraries, dispatch] = useReducer(itinerariesReducer, []);
  const [noMoreItineraries, setNoMoreItineraries] = useState(false);

  const deleteItinerary = useCallback((itineraryId) => {
    dispatch({
      type: 'deleteItinerary',
      itineraryId,
    });
  }, []);

  const setItinerariesFromSSR = useCallback((itinerariesFromSSR = []) => {
    dispatch({
      type: 'addItineraries',
      itineraries: itinerariesFromSSR,
    });
  }, []);

  const getItineraries = useCallback(
    async ({ lastItineraryDate, getNewerItineraries = false }) => {
      const result = await fetch(`/api/getItineraries`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({ lastItineraryDate, getNewerItineraries }),
      });
      const json = await result.json();
      const itinerariesResult = json.itineraries || [];
      if (itinerariesResult.length < 5) {
        setNoMoreItineraries(true);
      }
      dispatch({
        type: 'addItineraries',
        itineraries: itinerariesResult,
      });
    },
    []
  );

  return (
    <ItinerariesContext.Provider
      value={{ itineraries, setItinerariesFromSSR, getItineraries, noMoreItineraries, deleteItinerary }}
    >
      {children}
    </ItinerariesContext.Provider>
  );
};
