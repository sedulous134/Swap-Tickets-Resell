import { createContext, useContext, useState, useEffect } from 'react';

const CreateEventContext = createContext();

export const useCreateEvent = () => useContext(CreateEventContext);

export const CreateEventProvider = ({ children }) => {
  const [eventData, setEventData] = useState(() => {
    const stored = localStorage.getItem('eventData');
    return stored ? JSON.parse(stored) : {
      name: '',
      visibility: '',
      type: '',
      startDate: null,
      startTime: null,
      endDate: null,
      endTime: null,
      link: '',
      poster: null
    };
  });

  useEffect(() => {
    localStorage.setItem('eventData', JSON.stringify(eventData));
  }, [eventData]);

  return (
    <CreateEventContext.Provider value={{ eventData, setEventData }}>
      {children}
    </CreateEventContext.Provider>
  );
};
