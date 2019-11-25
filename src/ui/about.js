//; -*- mode: rjsx;-*-
/** @jsx jsx */
import { jsx, Styled } from 'theme-ui';
import { Box } from '@theme-ui/components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGlobeEurope, faEnvelope, faPhone } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';

const Container = props => <Box sx={{ maxWidth: 960, mx: 'auto', px: 3 }} {...props} />;

const Code = props => (
  <Box
    sx={{
      background: '#f4f4f4',
      color: '#666',
      border: '1px solid #ddd',
      borderLeft: '3px solid #f36d33',
      fontFamily: 'monospace',
      lineHeight: 'body',
      my: 3,
      px: 3,
      py: 2,
      maxWidth: '100%',
      overflow: 'auto',
      pageBreakInside: 'avoid',
      wordWrap: 'break-word'
    }}
    {...props}
  />
);


function Impressum() {
  return (
    <article>
      <Styled.h2>ELAN e.V.</Styled.h2>

      <Styled.p>
        The e-learning academic network (ELAN e.V.) is a German non-profit organization supporting
        higher-education organizations in all matters related to e-learning. Our services include
        practical tips about how to use digital technologies in education, legal advice and
        development of free, open-source software to support education.
      </Styled.p>

      <Styled.h3>Contact</Styled.h3>

      <Styled.p>
        Dr. Norbert Kleinefeld, Geschäftsführer
        <br />
        Karlstr. 23
        <br />
        D-26123 Oldenburg
      </Styled.p>

      <Styled.p>
        <FontAwesomeIcon icon={faGlobeEurope} />{' '}
        <Styled.a href="https://elan-ev.de">elan-ev.de</Styled.a>
        <br />
        <FontAwesomeIcon icon={faEnvelope} />{' '}
        <Styled.a href="mailto:kontakt@elan-ev.de">kontakt@elan-ev.de</Styled.a>
        <br />
        <FontAwesomeIcon icon={faPhone} />{' '}
        <Styled.a href="tel:+4944199866610">+49&thinsp;441 998&thinsp;666&thinsp;10</Styled.a>
      </Styled.p>

      <Styled.p>
        Registergericht: Amtsgericht Oldenburg
        <br />
        Registernummer: VR 200644
        <br />
        USt.-ID-Nr.: DE 265901392
      </Styled.p>
    </article>
  );
}

function About(props) {
  return (
    <Container className={props.className}>
      <article>
        <header>
          <Styled.h1>Opencast Studio</Styled.h1>
        </header>
        <Styled.p>
          A web-based recording studio for <Styled.a href="https://opencast.org">Opencast</Styled.a>
          .
        </Styled.p>
        <Styled.p>
          This is free software under the terms of the{' '}
          <Styled.a href="https://github.com/elan-ev/opencast-studio/blob/master/LICENSE">
            MIT License
          </Styled.a>{' '}
          developed by the <Styled.a href="https://elan-ev.de">ELAN e.V.</Styled.a> in cooperation
          with the <Styled.a href="https://ethz.ch">ETH Zürich</Styled.a>.
          {" Please report bugs or submit new features on the project's "}
          <Styled.a href="https://github.com/elan-ev/opencast-studio">GitHub page</Styled.a>.
        </Styled.p>
        <Styled.p>
          If you are interested in additional development or integrations into specific tools (e.g.
          LMS), please contact{' '}
          <Styled.a href="mailto:opencast-support@elan-ev.de">opencast-support@elan-ev.de</Styled.a>
          .
        </Styled.p>
        <Styled.h2>How it works</Styled.h2>
        <Styled.p>
          {`Opencast Studio uses the recording capabilities build into browsers to record audio and video streams.
            The recording happens in the user's browser.
            No server is involved in the recording.
            Finally, the recording is transferred directly from the users browser to the target Opencast.`}
        </Styled.p>
        <Styled.h2>Allow Studio to interact with your Opencast</Styled.h2>
        <Styled.p>
          For Studio to work with your Opencast, your need to allow this on your Opencast by serving
          a special HTTP header. The mechanism used is called{' '}
          <Styled.a href="https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS">
            Cross-Origin Resource Sharing
          </Styled.a>
          .
        </Styled.p>
        <Styled.p>
          {"Here is a list of the required headers in Nginx's configuration format:"}
        </Styled.p>
        <Code>
          # Basic open CORS for studio.opencast.org
          <br />
          add_header Access-Control-Allow-Origin https://studio.opencast.org;
          <br />
          {"add_header Access-Control-Allow-Methods 'GET, POST';"}
          <br />
          add_header Access-Control-Allow-Credentials true;
          <br />
          {"add_header Access-Control-Allow-Headers 'Origin,Content-Type,Accept,Authorization';"}
        </Code>
        <Styled.p>
          For a complete configuration file, take a look at the{' '}
          <Styled.a href="https://github.com/opencast/opencast-project-infrastructure/blob/9f09638e922d623cd4d3c91dd90aca39c421530d/ansible-allinone-demo-vm/roles/nginx/templates/nginx.conf#L158-L162">
            test server configuration
          </Styled.a>
          .
        </Styled.p>

        <Styled.h2>Credits</Styled.h2>
        <Styled.p>
          Thanks to the following people and institutions for contributing to this project:
        </Styled.p>
        <ul>
          <li>
            <Styled.a href="https://github.com/slampunk">Duncan Smith</Styled.a> for starting this
            project
          </li>
          <li>
            <Styled.a href="https://github.com/cilt-uct">University of Cape Town (CILT)</Styled.a>
            {' '}for letting Duncan start the project
          </li>
          <li>
            <Styled.a href="https://ethz.ch">ETH Zürich</Styled.a> for financial support and
            testing
          </li>
          <li>
            <Styled.a href="https://github.com/elan-ev">ELAN e.V.</Styled.a> for the final
            development
          </li>
        </ul>

        <Impressum />

        <Styled.h2>Version</Styled.h2>
        <Styled.p>
          Build date {process.env.REACT_APP_BUILD_DATE || '?'},
          commit{' '}
          <Styled.a
            aria-label="Git commit on GitHub"
            href={"https://github.com/elan-ev/opencast-studio/commit/"
                  + process.env.REACT_APP_GIT_SHA }
            >
            {process.env.REACT_APP_GIT_SHA || '?'}
          </Styled.a>.
        </Styled.p>

        <Box as="footer" sx={{ py: 3, textAlign: 'center' }}>
          <Link sx={{ variant: 'styles.a' }} to="/">
            ← Back to the Studio
          </Link>
        </Box>
      </article>
    </Container>
  );
}

export default About;
