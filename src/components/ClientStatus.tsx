import { useCallback, useEffect } from "react";

import { Button as CloseButton } from "../components";
import { useGuideState } from "../lib/guideState";
import { CLIENT_STATES } from "../lib/constants";
import { sendMessage } from "../lib/utils";
import { getClientData } from "../lib/clientStore";

export const ClientStatus = () => {
  const { clientStatus, clientName, setClientName } = useGuideState(state => state);
  const status = CLIENT_STATES[clientStatus];

  const copy = useCallback(() => {
    switch (status) {
      case "unavailable": 
        return "no one connected";
      
      case "present":
        return "client is present";

      case "waiting":
        return `${clientName} is waiting`;
      
      case "authorized":
        return <div>
          {`${clientName} is here`}
          <CloseButton onClick={sendTerminationMessage} customClass={"rounded-full border"} circle={15}>&#10006;</CloseButton>
        </div>;
      
      case "denied":
        return `${clientName} was denied`;
      
      case "cancelled":
        return `${clientName} cancelled request`
    }    
  }, [status]);

  const sendTerminationMessage = () => {
    sendMessage({ action: "showEndSessionModal" }, undefined, window.top.location.href);
  };

  useEffect(() => {
    getClientData("username", setClientName);
  }, []);

  return (
    <div className={`font-bold pl-0 pr-5 color-grey-very-dark`}>
      {copy()}
    </div>
  )
};
