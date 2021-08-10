import React from 'react';
import { Container } from 'react-bootstrap';

const Layout = ({ children }) => (
    <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
      <div className="w-100" style={{ maxWidth: '450px' }}>
          {children}
      </div>
    </Container>
);

export default Layout;
