import { useGuideState } from "../lib/guideState";
import { CLIENT_STATES } from "../lib/constants";
import { useCallback, useEffect } from "react";
import { getUserData } from "../lib/guideStore";

export const ClientStatus = () => {
  const { clientStatus, clientName, setClientName } = useGuideState(state => state);
  const status = CLIENT_STATES[clientStatus];

  useEffect(() => {
    getUserData("clientName", setClientName);
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
      
      case "cancelled":
        return `${clientName} cancelled request`
    }    
  }, [status]);

  return (
    <div className={`font-bold pl-0 pr-5 color-grey-very-dark`}>{copy()}</div>
  )
};
