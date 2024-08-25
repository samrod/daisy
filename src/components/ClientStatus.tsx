import { useCallback, useEffect } from "react";

import { useGuideState, getLinkData, useSessionState, pushSessionData, useLinkState } from "state";
import { CLIENT_STATES, sendMessage, CLIENT_STATE_DISPLAYS } from "lib";
import { Button } from "components";

export const ClientStatus = () => {
  const { clientStatus, clientName, setClientName } = useGuideState(state => state);
  const { clientLink } = useLinkState(state => state);
  const { session, setSession } = useSessionState(state => state);
  const status = CLIENT_STATES[clientStatus];

  const showEndSessionModalData = {
    title: `End ${clientName}'s session`,
    body: `Are you sure you want to end this session with ${clientName}?`,
    cancel: {
      text: "Cancel",
      action: ["onCancelEndSessionModal"],
    },
    accept: {
      text: "End Session",
      action: ["onEndClientSession"],
    },
  };

  const sendTerminationMessage = () => {
    sendMessage({ action: "showModal", params: showEndSessionModalData });
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
