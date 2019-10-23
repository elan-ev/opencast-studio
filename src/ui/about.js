//; -*- mode: rjsx;-*-
import React from 'react';
import styled from 'styled-components/macro';
import css from '@styled-system/css';

import { Box, Container, Heading, Link, Text } from './base-components';

const Code = props => (
  <Box
    bg="#f4f4f4"
    color="#666"
    border="1px solid #ddd"
    borderLeft="3px solid #f36d33"
    fontFamily="monospace"
    lineHeight="body"
    my={3}
    px={3}
    py={2}
    maxWidth="100%"
    overflow="auto"
    css={css({ pageBreakInside: 'avoid', wordWrap: 'break-word' })}
    {...props}
  />
);

function About(props) {
  return (
    <Container className={props.className}>
      <article>
        <header>
          <Heading as="h1" variant="display">
            Opencast Studio
          </Heading>
        </header>
        <Text>
          A web-based recording studio for <Link href="https://opencast.org">Opencast</Link>.
        </Text>
        <Text>
          This is free software under the terms of the{' '}
          <Link href="https://github.com/elan-ev/opencast-studio/blob/master/LICENSE">
            MIT License
          </Link>{' '}
          developed by the <Link href="https://elan-ev.de">ELAN e.V.</Link> in cooperation with the{' '}
          <Link href="https://ethz.ch">ETH Zürich</Link>. Please report bugs or submit new features
          on the project's{' '}
          <Link href="https://github.com/elan-ev/opencast-studio">GitHub page</Link>.
        </Text>
        <Text>
          If you are interested in additional development or integrations into specific tools (e.g.
          LMS), please contact{' '}
          <Link href="mailto:opencast-support@elan-ev.de">opencast-support@elan-ev.de</Link>.
        </Text>
        <Heading>How it works</Heading>
        <Text>
          Opencast Studio uses the recording capabilities build into browsers to record audio and
          video streams. The recording happens in the user's browser. Finally, the recording is
          transferred directly from the users browser to the target Opencast.
        </Text>
        <Heading>Allow Studio to interact with your Opencast</Heading>
        <Text>
          For Studio to work with your Opencast, your need to allow this on your Opencast by serving
          a special HTTP header. The mechanism used is called{' '}
          <Link href="https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS">
            Cross-Origin Resource Sharing
          </Link>
          .
        </Text>
        <Text>Here is a list of the required headers Nginx's configuration format:</Text>
        <Code>
          # Basic open CORS for studio.opencast.org
          <br />
          add_header Access-Control-Allow-Origin https://studio.opencast.org;
          <br />
          add_header Access-Control-Allow-Methods 'GET, POST';
          <br />
          add_header Access-Control-Allow-Credentials true;
          <br />
          add_header Access-Control-Allow-Headers 'Origin,Content-Type,Accept,Authorization';
        </Code>
        <Text>
          For a complete configuration file, take a look at the{' '}
          <Link href="https://github.com/opencast/opencast-project-infrastructure/blob/9f09638e922d623cd4d3c91dd90aca39c421530d/ansible-allinone-demo-vm/roles/nginx/templates/nginx.conf#L158-L162">
            test server configuration
          </Link>
          .
        </Text>

        <Heading>Credits</Heading>
        <Text>
          Thanks to the following people and institutions for contributing to this project:
        </Text>
        <ul>
          <li>
            <Text>
              <Link href="https://github.com/slampunk">Duncan Smith</Link> for starting this project
            </Text>
          </li>
          <li>
            <Text>
              <Link href="https://github.com/cilt-uct">University of Cape Town (CILT)</Link>
              for letting Duncan start the project
            </Text>
          </li>
          <li>
            <Text>
              <Link href="https://ethz.ch">ETH Zürich</Link> for financial support and testing
            </Text>
          </li>
          <li>
            <Text>
              <Link href="https://github.com/elan-ev">ELAN e.V.</Link> for the final development
            </Text>
          </li>
        </ul>
        <footer>
          <Link display="block" textAlign="center" href="index.html">
            ← Back to the Studio
          </Link>
        </footer>
      </article>
    </Container>
  );
}

const StyledAbout = styled(About)``;

export default StyledAbout;
