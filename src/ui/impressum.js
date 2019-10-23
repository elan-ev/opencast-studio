//; -*- mode: rjsx;-*-
import React from 'react';
import styled from 'styled-components/macro';
import { navigate } from '@reach/router';

import { Box, Container, Heading, Link, Text } from './base-components';

function Impressum(props) {
  return (
    <Container className={props.className}>
      <article>
        <header>
          <Heading>Impressum</Heading>
        </header>

        <Text pb={3}>ELAN e.V. (E-Learning Academic Network)</Text>

        <Text pb={3}>
          Dr. Norbert Kleinefeld, Geschäftsführer
          <br />
          Karlstr. 23
          <br />
          D-26123 Oldenburg
        </Text>

        <Text pb={3}>
          URL: <a href="https://elan-ev.de">https://elan-ev.de</a>
          <br />
          E-Mail: <a href="mailto:kontakt@elan-ev.de">kontakt@elan-ev.de</a>
          <br />
          Telefon: +49 441 998 666 10
        </Text>

        <Text pb={3}>
          Registergericht: Amtsgericht Oldenburg
          <br />
          Registernummer: VR 200644
          <br />
          USt.-ID-Nr.: DE 265901392
        </Text>

        <Box as="footer" textAlign="center">
          <Link onClick={() => navigate('/')}>← Back to the Studio</Link>
        </Box>
      </article>
    </Container>
  );
}

const StyledImpressum = styled(Impressum)``;

export default StyledImpressum;
