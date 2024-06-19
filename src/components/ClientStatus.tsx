import { useGuideState } from "../lib/guideState";
import { CLIENT_STATES } from "../lib/constants";
import { useCallback, useEffect } from "react";
import { getUserData } from "../lib/store";

export const ClientStatus = () => {
  const { clientStatus, clientName, setClientName } = useGuideState(state => state);
  const status = CLIENT_STATES[clientStatus];

  useEffect(() => {
    getUserData({ key: "clientName", callback: setClientName });
  }, []);

  const copy = useCallback(() => {
    switch (status) {
      case "unavailable": 
        return "no one connected";
      
      case "present":
        return "client is present";

      case "waiting":
        return `${clientName} is waiting`;
      
      case "authorized":
        return `${clientName} is ready`;
      
      case "denied":
        return `${clientName} was denied`;
    }    
  }, [status]);

  return (
    <div className={`font-bold px-4 color-grey-very-dark`}>{copy()}</div>
  )
};
