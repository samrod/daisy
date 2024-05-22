import { useState, useCallback, FormEvent, useEffect, useRef } from 'react'
import { Alert, Form, Button, Row } from "react-bootstrap";
import { getUserData, isUniqueUserProp, updateUser } from '../../lib/store';
import { isEmpty } from 'lodash';
import { LINK_PLACEHOLDER } from '../../lib/constants';

const Link = () => {
  const [link, setLink] = useState();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const displayLink = isEmpty(link) ? `[${LINK_PLACEHOLDER}]` : link.toLowerCase();

  const onChangeLink = ({ target }) => {
    setLink(target.value);
  };

  const updateLink = (value) => {
    if (!isEmpty(value)) {
      setLink(value);
    }
  };

  const handleSubmit = useCallback(async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setLoading(true);
    setError("");
    const response = await isUniqueUserProp("link", link);

    if (response === true) {
      updateUser("link", link);
    } else if (response === false) {
      setError(`"${link}" is already used. Please try another link.`);
    } else {
      setError(response);
    }
    setLoading(false);
  }, [link]);

  useEffect(() => {
    getUserData({ key: "link", callback: updateLink });
  }, [])

  return (
    <>
      <h4 className="text-center mt-3 mb-3">http://daisyemdr.com/{displayLink}</h4>
      {error && <Alert variant="danger">{error}</Alert>}
      <Form onSubmit={handleSubmit} className="accountForm">
        <Form.Group id="link">
          <Form.Label>Specify a patient link to your EMDR panel.</Form.Label>
          <Form.Control
            size="sm"
            type="text"
            autoComplete="link"
            onChange={onChangeLink}
            required
            defaultValue={link}
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

export default Link;
