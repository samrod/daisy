import { useState, useCallback, FormEvent, useEffect } from 'react'
import { Alert, Form, Button, Row } from "react-bootstrap";
import { isEmpty } from 'lodash';

import { getUserData, propExists, updateClientLink } from '../../lib/store';
import { LINK_PLACEHOLDER } from '../../lib/constants';

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
    getUserData({ key: "clientLink", callback: updateLink });
  }, [])

  return (
    <>
      <h4 className="text-center mt-3 mb-3">http://daisyemdr.com/{displayLink}</h4>
      {error && <Alert variant="danger">{error}</Alert>}
      <Form onSubmit={handleSubmit} className="accountForm">
        <Form.Group id="clientLink">
          <Form.Label>Specify a client link for your EMDR panel.</Form.Label>
          <Form.Control
            size="sm"
            type="text"
            autoComplete="clientLink"
            onChange={onChangeLink}
            required
            defaultValue={clientLink}
            placeholder={LINK_PLACEHOLDER}
          />
        </Form.Group>

        <Row>
          <Button size="sm" disabled={loading} type="submit">UPDATE</Button>
        </Row>
        </Form>
    </>
  )
}
