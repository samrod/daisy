import { useState, useCallback, FormEvent, useEffect, useRef } from "react"
import { isEmpty } from "lodash";

import { updateClientLink, getGuideData, uniqueClientLink } from "state";
import { Alert, Button, Col, TextGroup } from "components";
import { LINK_PLACEHOLDER } from "lib";

export const Link = () => {
  const [clientLink, setClientLink] = useState("");
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const displayLink = isEmpty(clientLink) ? `[${LINK_PLACEHOLDER}]` : clientLink.toLowerCase();

  const linkField = useRef<HTMLInputElement>();
  const [disabled, setDisabled] = useState(false);

  const onChangeLink = ({ target }) => {
    setClientLink(target.value);
  };

  const updateLink = (value: string) => {
    if (!isEmpty(value)) {
      setClientLink(value);
    }
  };

  const handleSubmit = useCallback(async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const exists = await uniqueClientLink(clientLink, true);
    if (exists) {
      setError(`"${clientLink}" is already used. Please try a different client link.`);
    } else {
      updateClientLink(clientLink);
    }
    setLoading(false);
  }, [clientLink]);

  useEffect(() => {
    const value = linkField.current?.value.toString();
    setDisabled(loading || !value.length);
  }, [loading, linkField.current?.value]);

  useEffect(() => {
    getGuideData("clientLink", updateLink);
  }, [])

  return (
    <Col cols={4} as="form" justify="start" onSubmit={handleSubmit} klass="accountForm">
      <h3 className="text-center">http://daisyemdr.com/<span className="color-standard">{displayLink}</span></h3>
      <Alert persist>{error}</Alert>
      <TextGroup
        ref={linkField}
        label="Specify a client link for your EMDR panel."
        textProps={{          
          autoComplete: "off",
          onChange: onChangeLink,
          placeholder: LINK_PLACEHOLDER,
        }}
      />
      <Button stretch disabled={disabled} type="submit">UPDATE</Button>
    </Col>
  )
}
