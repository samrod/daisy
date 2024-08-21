import { useCallback, useEffect } from "react";

import { useGuideState, getLinkData, useSessionState, pushSessionData, useClientState } from "state";
import { CLIENT_STATES, sendMessage, CLIENT_STATE_DISPLAYS } from "lib";
import { Button } from "components";

export const ClientStatus = () => {
  const { clientStatus, clientName, setClientName } = useGuideState(state => state);
  const { clientLink } = useClientState(state => state);
  const { session, setSession } = useSessionState(state => state);
  const status = CLIENT_STATES[clientStatus];

  const sendTerminationMessage = () => {
    sendMessage({ action: "showEndSessionModal" });
  };

  const captureSession = useCallback((session: string) => {
    pushSessionData(session);
    setSession(session);
  }, [setSession]);

  useEffect(() => {
    getLinkData("username", (value: string) => setClientName(value, false));
    getLinkData("session", captureSession);
  }, [clientStatus, clientName, captureSession, setClientName]);

  return (
    <div className={`font-bold text-sm flex flex-nowrap items-center color-grey-very-dark gap-3 px-3`}>
      {CLIENT_STATE_DISPLAYS(clientLink, clientName, session)[status]}
      {session &&
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
