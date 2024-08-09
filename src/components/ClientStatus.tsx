import { useEffect } from "react";

import { useGuideState, getLinkData } from "../state";
import { CLIENT_STATES, sendMessage, CLIENT_STATE_DISPLAYS } from "../lib";
import { Button } from "../components";

export const ClientStatus = () => {
  const { clientLink, clientStatus, clientName, setClientName } = useGuideState(state => state);
  const status = CLIENT_STATES[clientStatus];

  const sendTerminationMessage = () => {
    sendMessage({ action: "showEndSessionModal" });
  };

  useEffect(() => {
    getLinkData("username", (value: string) => setClientName(value, false));
  }, [clientStatus, clientName, setClientName]);

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
