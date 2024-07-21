import { useEffect, useRef } from "react";

import {
  useGuideState,
  CLIENT_STATES,
  sendMessage,
  getLinkData,
  CLIENT_STATE_DISPLAYS,
} from "../lib";
import { Button } from "../components";

export const ClientStatus = () => {
  const { clientLink, clientStatus, clientName, setClientName } = useGuideState(state => state);
  const status = CLIENT_STATES[clientStatus];
  const clientNameSet = useRef(false);

  const sendTerminationMessage = () => {
    sendMessage({ action: "showEndSessionModal" });
  };

  useEffect(() => {
    getLinkData("username", setClientName);
  }, [clientStatus, clientName]);

  return (
    <div className={`font-bold text-sm flex flex-nowrap items-center color-grey-very-dark gap-3 px-3`}>
      {CLIENT_STATE_DISPLAYS(clientLink, clientName)[status]}
      {status === "active" &&
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
