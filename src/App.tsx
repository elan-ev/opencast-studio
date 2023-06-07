import { useState, Fragment } from 'react';
import { Beforeunload } from 'react-beforeunload';
import { SettingsManager, useSettings } from './settings';

import { Provider, useStudioState, STATE_UPLOADED, STATE_UPLOADING } from './studio-state';



type Props = {
  settingsManager: SettingsManager;
  userHasWebcam: boolean;
};

export const App: React.FC<Props> = ({ settingsManager, userHasWebcam }) => {
  const settings = useSettings();

  return (
    <div>Hello</div>
  );
  // <Provider>
  //   <Flex sx={{ flexDirection: 'column', height: '100%' }}>
  //     <Header />
  //     <main sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '285px' }}>
  //       <Warnings />
  //       <Routes settingsManager={settingsManager} userHasWebcam={userHasWebcam} />
  //     </main>
  //   </Flex>
  // </Provider>
};

// const PreventClose = () => {
//   const { recordings, upload } = useStudioState();
//   const downloaded = recordings.every(rec => rec.downloaded);
//   const uploaded = upload.state === STATE_UPLOADED;
//   const uploading = upload.state === STATE_UPLOADING;

//   const handler = (event: Event) => {
//     if ((recordings?.length > 0 && !uploaded && !downloaded) || uploading) {
//       event.preventDefault();
//     }
//   };

//   return <Beforeunload onBeforeunload={handler} />;
// };

