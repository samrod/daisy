import { useState, useCallback, FormEvent, useEffect } from 'react'
import { isEmpty } from 'lodash';

import { getUserData, updateClientLink } from '../../lib/guideStore';
import { LINK_PLACEHOLDER } from '../../lib/constants';
import { Alert, Button, Row, TextGroup } from '../../components';
import { propExists } from '../../lib/firebase';

export const Link = () => {
  const [clientLink, setClientLink] = useState("");
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const displayLink = isEmpty(clientLink) ? `[${LINK_PLACEHOLDER}]` : clientLink.toLowerCase();

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
    const exists = await propExists("clientLinks", clientLink);
    if (exists) {
      setError(`"${clientLink}" is already used. Please try a different client link.`);
    } else {
      updateClientLink(clientLink);
    }

    setLoading(false);
  }, [clientLink]);

  useEffect(() => {
    getUserData("clientLink", updateLink);
  }, [])

  return (
    <>
      <h3 className="text-center">http://daisyemdr.com/{displayLink}</h3>
      <Alert type="danger">{error}</Alert>
      <form onSubmit={handleSubmit} className="accountForm">
        <TextGroup
          label="Specify a client link for your EMDR panel."
          textProps={{          
            autoComplete: "off",
            onChange: onChangeLink,
            placeholder: LINK_PLACEHOLDER,
          }}
        />
        <Row>
          <Button disabled={loading} type="submit">UPDATE</Button>
        </Row>
      </form>
    </>
  )
}
