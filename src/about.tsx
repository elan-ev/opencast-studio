import React from "react";
import { DEFINES } from "./defines";
import { FiGlobe, FiMail, FiPhone } from "react-icons/fi";
import { COLORS } from "./util";


export const About: React.FC = () => (
  <article css={{
    p: {
      margin: "8px 0",
    },
    h2: {
      marginTop: 24,
      marginBottom: 4,
      fontSize: 21,
    },
    a: {
      color: COLORS.accent7,
      "&:hover": {
        textDecoration: "none",
        color: COLORS.accent8,
      },
    },
  }}>
    <header>
      <h1>Opencast Studio</h1>
    </header>
    <p>
      A web-based recording studio for <a href="https://opencast.org">Opencast</a>.
    </p>
    <p>
      Opencast Studio allows you to record your camera, your display and your microphoneʼs audio.
      You can then either download your recordings or upload them directly to an Opencast
      instance (usually the one of your university).
    </p>
    <p>
      This is free software under the terms of the{" "}
      <a href="https://github.com/elan-ev/opencast-studio/blob/master/LICENSE">
        MIT License
      </a>{" "}
      developed by the <a href="https://elan-ev.de">ELAN e.V.</a> in cooperation
      with the <a href="https://ethz.ch">ETH Zürich</a>.
    </p>

    <h2>How it works</h2>
    <p>
      Opencast Studio uses the recording capabilities built into modern browsers to record
      audio and video streams. The recording happens in the userʼs browser and no server is
      involved in the recording.
    </p>

    {DEFINES.showLegalNotices && (
      <React.Fragment>
        <h2>Support</h2>
        <p>
          If you are experiencing any difficulties or found any bugs,
          please take a look at the{" "}
          <a href="https://github.com/elan-ev/opencast-studio/issues">
            issue tracker on GitHub
          </a>.
          Before filing a new issue, please check if one about your topic already exists.
          We regularly check incoming issues and do our best to address bugs in a timely manner.
        </p>
        <p>
          If you are interested in additional development
          or want to support the development of Opencast Studio, please contact{" "}
          <a href="mailto:opencast-support@elan-ev.de">
            opencast-support@elan-ev.de
          </a>.
        </p>
      </React.Fragment>
    )}

    <h2>Credits</h2>
    <p>
      Thanks to the following people and institutions for contributing to this project:
    </p>
    <ul>
      <li>
        <a href="https://github.com/slampunk">Duncan Smith</a> for starting this
        project
      </li>
      <li>
        <a href="https://github.com/cilt-uct">University of Cape Town (CILT)</a>
        {" "}for letting Duncan start the project
      </li>
      <li>
        <a href="https://ethz.ch">ETH Zürich</a> for financial support and
        testing
      </li>
      <li>
        <a href="https://github.com/elan-ev">ELAN e.V.</a> for the re-implementation
        and the ongoing development
      </li>
      <li>
        And many members from the Opencast community who helped along the way.
      </li>
    </ul>

    {/* process.env.REACT_APP_INCLUDE_LEGAL_NOTICES === '1' && <LegalNotices /> */}
    {DEFINES.showLegalNotices && <>
      <h2>ELAN e.V.</h2>

      <p>
        The e-learning academic network (ELAN e.V.) is a German non-profit organization supporting
        higher-education organizations in all matters related to e-learning. Our services include
        practical tips about how to use digital technologies in education, legal advice and
        development of free, open-source software to support education.
      </p>

      <h3>Contact</h3>

      <p>
        Dr. Norbert Kleinefeld, Geschäftsführer
        <br />
        Karlstr. 23
        <br />
        D-26123 Oldenburg
      </p>

      <p css={{ svg: { marginRight: 8, verticalAlign: "middle" } }}>
        <FiGlobe />
        <a href="https://elan-ev.de">elan-ev.de</a>
        <br />
        <FiMail />
        <a href="mailto:kontakt@elan-ev.de">kontakt@elan-ev.de</a>
        <br />
        <FiPhone />
        <a href="tel:+4944199866610">+49&thinsp;441 998&thinsp;666&thinsp;10</a>
      </p>

      <p>
        Registergericht: Amtsgericht Oldenburg
        <br />
        Registernummer: VR 200644
        <br />
        USt.-ID-Nr.: DE 265901392
      </p>
    </>}

    <h2>Version</h2>
    <p>
      Build date {DEFINES.buildDate ?? "?"},
      commit{" "}
      <a
        aria-label="Git commit on GitHub"
        href={"https://github.com/elan-ev/opencast-studio/commit/" + DEFINES.commitSha}
      >
        {DEFINES.commitSha ?? "?"}
      </a>.
    </p>
  </article>
);
