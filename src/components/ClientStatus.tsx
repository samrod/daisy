import { useCallback, useEffect } from "react";

import { Button, Button as CloseButton } from "../components";
import { useGuideState } from "../lib/guideState";
import { CLIENT_STATES } from "../lib/constants";
import { sendMessage } from "../lib/utils";
import { getClientData } from "../lib/clientStore";

export const ClientStatus = () => {
  const { clientLink, clientStatus, clientName, setClientName } = useGuideState(state => state);
  const status = CLIENT_STATES[clientStatus];

  const copy = useCallback(() => {
    switch (status) {
      case "unavailable": 
        return "no one connected";
      
      case "present":
        return `someon's at ${clientLink}`;

      case "waiting":
        return `${clientName} is waiting`;
      
      case "authorized":
        return `${clientName} is active`;
      
      case "denied":
        return `${clientName} was denied`;
      
      case "cancelled":
        return `${clientName} cancelled request`
    }    
  }, [status]);

  const sendTerminationMessage = () => {
    sendMessage({ action: "showEndSessionModal" });
  };

  useEffect(() => {
    getClientData("username", setClientName);
  });

  return (
    <div className={`font-bold text-sm flex flex-nowrap items-center color-grey-very-dark gap-3 px-3`}>
      {copy()}
      {status === "authorized" &&
        <Button
          onClick={sendTerminationMessage}
          variant="dark"
          size="xs"
          value="END"
          klass="m-0 -mr-3 rounded-none"
        />
      }
    </div>
  );
};
