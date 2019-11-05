//; -*- mode: rjsx;-*-
/** @jsx jsx */
import { jsx, Styled } from 'theme-ui';

import { Link } from '@reach/router';
import { Box } from '@theme-ui/components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGlobeEurope, faEnvelope, faPhone } from '@fortawesome/free-solid-svg-icons';

const Container = props => <Box sx={{ maxWidth: 960, mx: 'auto', px: 3 }} {...props} />;

function Impressum(props) {
  return (
    <Container className={props.className}>
      <article>
        <header>
          <Styled.h1>ELAN e.V.</Styled.h1>
        </header>

        <Styled.p>
          The e-learning academic network (ELAN e.V.) is a German non-profit organization supporting
          higher-education organizations in all matters related to e-learning. Our services include
          practical tips about how to use digital technologies in education, legal advice and
          development of free, open-source software to support education.
        </Styled.p>

        <Styled.h2>Contact</Styled.h2>

        <Styled.p>
          Dr. Norbert Kleinefeld, Geschäftsführer
          <br />
          Karlstr. 23
          <br />
          D-26123 Oldenburg
        </Styled.p>

        <Styled.p>
          <FontAwesomeIcon icon={faGlobeEurope} /> <a href="https://elan-ev.de">elan-ev.de</a>
          <br />
          <FontAwesomeIcon icon={faEnvelope} />{' '}
          <a href="mailto:kontakt@elan-ev.de">kontakt@elan-ev.de</a>
          <br />
          <FontAwesomeIcon icon={faPhone} /> +49 441 998 666 10
        </Styled.p>

        <Styled.p>
          Registergericht: Amtsgericht Oldenburg
          <br />
          Registernummer: VR 200644
          <br />
          USt.-ID-Nr.: DE 265901392
        </Styled.p>

        <Box as="footer" sx={{ textAlign: 'center' }}>
          <Link to="/">← Back to the Studio</Link>
        </Box>
      </article>
    </Container>
  );
}

export default Impressum;
