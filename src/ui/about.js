//; -*- mode: rjsx;-*-
/** @jsx jsx */
import React from 'react';
import { jsx, Styled } from 'theme-ui';
import { Container } from '@theme-ui/components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGlobeEurope, faEnvelope, faPhone } from '@fortawesome/free-solid-svg-icons';


function LegalNotices() {
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
    <Container>
      <article>
        <header>
          <Styled.h1>Opencast Studio</Styled.h1>
        </header>
        <Styled.p>
          A web-based recording studio for <Styled.a href="https://opencast.org">Opencast</Styled.a>.
        <Styled.p>
        </Styled.p>
          Opencast Studio allows you to record your camera, your display and your microphoneʼs audio.
          You can then either download your recordings or upload them directly to an Opencast
          instance (usually the one of your university).
        </Styled.p>
        <Styled.p>
          This application is free, open software developed{' '}
          <Styled.a href="https://github.com/elan-ev/opencast-studio">on GitHub</Styled.a>.
        </Styled.p>

        <Styled.h2>How it works</Styled.h2>
        <Styled.p>
          Opencast Studio uses the recording capabilities built into modern browsers to record
          audio and video streams. The recording happens in the userʼs browser and no server is
          involved in the recording.
        </Styled.p>

        { process.env.REACT_APP_INCLUDE_LEGAL_NOTICES === '1' && (
          <React.Fragment>
            <Styled.h2>Support</Styled.h2>
            <Styled.p>
              If you are interested in additional development or want to introduce Opencast Studio
              at your university, please contact{' '}
              <Styled.a href="mailto:opencast-support@elan-ev.de">
                opencast-support@elan-ev.de
              </Styled.a>.
            </Styled.p>
          </React.Fragment>
        )}

        { process.env.REACT_APP_INCLUDE_LEGAL_NOTICES === '1' && <LegalNotices /> }

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
      </article>
    </Container>
  );
}

export default About;
