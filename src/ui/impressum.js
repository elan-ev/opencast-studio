//; -*- mode: rjsx;-*-
import React from 'react';
import styled from 'styled-components/macro';
import { navigate } from '@reach/router';

import { Box, Container, Heading, Link, Text } from './base-components';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGlobeEurope, faEnvelope, faPhone } from '@fortawesome/free-solid-svg-icons';

function Impressum(props) {
  return (
    <Container className={props.className}>
      <article>
        <header>
          <Heading>ELAN e.V.</Heading>
        </header>

        <Text pb={3}>
          The e-learning academic network (ELAN e.V.) is a German non-profit
          organization supporting higher-education organizations in all matters
          related to e-learning. Our services include practical tips about how
          to use digital technologies in education, legal advice and development
          of free, open-source software to support education.
        </Text>

        <Heading>Contact</Heading>

        <Text pb={3}>
          Dr. Norbert Kleinefeld, Geschäftsführer
          <br />
          Karlstr. 23
          <br />
          D-26123 Oldenburg
        </Text>

        <Text pb={3}>
          <FontAwesomeIcon icon={faGlobeEurope} />{" "}
          <a href="https://elan-ev.de">elan-ev.de</a>
          <br />
          <FontAwesomeIcon icon={faEnvelope} />{" "}
          <a href="mailto:kontakt@elan-ev.de">kontakt@elan-ev.de</a>
          <br />
          <FontAwesomeIcon icon={faPhone} />{" "}
          +49 441 998 666 10
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
