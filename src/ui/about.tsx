//; -*- mode: rjsx;-*-
/** @jsx jsx */
import React from 'react';
import { jsx, Themed } from 'theme-ui';
import { Container } from '@theme-ui/components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGlobeEurope, faEnvelope, faPhone } from '@fortawesome/free-solid-svg-icons';


const LegalNotices: React.FC = () => (
  <article>
    <Themed.h2>ELAN e.V.</Themed.h2>

    <Themed.p>
      The e-learning academic network (ELAN e.V.) is a German non-profit organization supporting
      higher-education organizations in all matters related to e-learning. Our services include
      practical tips about how to use digital technologies in education, legal advice and
      development of free, open-source software to support education.
    </Themed.p>

    <Themed.h3>Contact</Themed.h3>

    <Themed.p>
      Dr. Norbert Kleinefeld, Geschäftsführer
      <br />
      Karlstr. 23
      <br />
      D-26123 Oldenburg
    </Themed.p>

    <Themed.p>
      <FontAwesomeIcon icon={faGlobeEurope} />{' '}
      <Themed.a href="https://elan-ev.de">elan-ev.de</Themed.a>
      <br />
      <FontAwesomeIcon icon={faEnvelope} />{' '}
      <Themed.a href="mailto:kontakt@elan-ev.de">kontakt@elan-ev.de</Themed.a>
      <br />
      <FontAwesomeIcon icon={faPhone} />{' '}
      <Themed.a href="tel:+4944199866610">+49&thinsp;441 998&thinsp;666&thinsp;10</Themed.a>
    </Themed.p>

    <Themed.p>
      Registergericht: Amtsgericht Oldenburg
      <br />
      Registernummer: VR 200644
      <br />
      USt.-ID-Nr.: DE 265901392
    </Themed.p>
  </article>
);

const About: React.FC = () => (
  <Container>
    <article sx={{ maxWidth: '900px', margin: '0 auto' }}>
      <header>
        <Themed.h1>Opencast Studio</Themed.h1>
      </header>
      <Themed.p>
        A web-based recording studio for <Themed.a href="https://opencast.org">Opencast</Themed.a>.
      </Themed.p>
      <Themed.p>
        Opencast Studio allows you to record your camera, your display and your microphoneʼs audio.
        You can then either download your recordings or upload them directly to an Opencast
        instance (usually the one of your university).
      </Themed.p>
      <Themed.p>
        This is free software under the terms of the{' '}
        <Themed.a href="https://github.com/elan-ev/opencast-studio/blob/master/LICENSE">
          MIT License
        </Themed.a>{' '}
        developed by the <Themed.a href="https://elan-ev.de">ELAN e.V.</Themed.a> in cooperation
        with the <Themed.a href="https://ethz.ch">ETH Zürich</Themed.a>.
      </Themed.p>

      <Themed.h2>How it works</Themed.h2>
      <Themed.p>
        Opencast Studio uses the recording capabilities built into modern browsers to record
        audio and video streams. The recording happens in the userʼs browser and no server is
        involved in the recording.
      </Themed.p>

      { process.env.REACT_APP_INCLUDE_LEGAL_NOTICES === '1' && (
        <React.Fragment>
          <Themed.h2>Support</Themed.h2>
          <Themed.p>
            If you are experiencing any difficulties or found any bugs,
            please take a look at the{' '}
            <Themed.a href="https://github.com/elan-ev/opencast-studio/issues">
              issue tracker on GitHub
            </Themed.a>.
            Before filing a new issue, please check if one about your topic already exists.
            We regularly check incoming issues and do our best to address bugs in a timely manner.
          </Themed.p>
          <Themed.p>
            If you are interested in additional development
            or want to support the development of Opencast Studio, please contact{' '}
            <Themed.a href="mailto:opencast-support@elan-ev.de">
              opencast-support@elan-ev.de
            </Themed.a>.
          </Themed.p>
        </React.Fragment>
      )}

      <Themed.h2>Credits</Themed.h2>
      <Themed.p>
        Thanks to the following people and institutions for contributing to this project:
      </Themed.p>
      <ul>
        <li>
          <Themed.a href="https://github.com/slampunk">Duncan Smith</Themed.a> for starting this
          project
        </li>
        <li>
          <Themed.a href="https://github.com/cilt-uct">University of Cape Town (CILT)</Themed.a>
          {' '}for letting Duncan start the project
        </li>
        <li>
          <Themed.a href="https://ethz.ch">ETH Zürich</Themed.a> for financial support and
          testing
        </li>
        <li>
          <Themed.a href="https://github.com/elan-ev">ELAN e.V.</Themed.a> for the re-implementation
          and the ongoing development
        </li>
        <li>
          And many members from the Opencast community who helped along the way.
        </li>
      </ul>

      { process.env.REACT_APP_INCLUDE_LEGAL_NOTICES === '1' && <LegalNotices /> }

      <Themed.h2>Version</Themed.h2>
      <Themed.p>
        Build date {process.env.REACT_APP_BUILD_DATE || '?'},
        commit{' '}
        <Themed.a
          aria-label="Git commit on GitHub"
          href={"https://github.com/elan-ev/opencast-studio/commit/"
                + process.env.REACT_APP_GIT_SHA }
        >
          {process.env.REACT_APP_GIT_SHA || '?'}
        </Themed.a>.
      </Themed.p>
    </article>
  </Container>
);

export default About;
