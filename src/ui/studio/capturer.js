export async function startAudioCapture(dispatch, deviceId = null) {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: deviceId ? { deviceId } : true,
      video: false
    });
    stream.getTracks().forEach(track => {
      track.onended = () => {
        dispatch({ type: 'UNSHARE_AUDIO' });
      };
    });

    dispatch({ type: 'SHARE_AUDIO', payload: stream });
    return true;
  } catch (err) {
    // TODO: there several types of exceptions; certainly we should differentiate here one day
    console.error('Error: ' + err);

    dispatch({ type: 'BLOCK_AUDIO' });
    return false;
  }
}

export async function startDisplayCapture(
  dispatch,
  displayMediaOptions = { video: true, audio: false }
) {
  try {
    const stream = await navigator.mediaDevices.getDisplayMedia(displayMediaOptions);
    stream.getTracks().forEach(track => {
      track.onended = () => {
        dispatch({ type: 'UNSHARE_DISPLAY' });
      };
    });

    dispatch({ type: 'SHARE_DISPLAY', payload: stream });
  } catch (err) {
    // TODO: there 7 types of exceptions; certainly we should differentiate here one day
    console.error('Error: ' + err);

    dispatch({ type: 'BLOCK_DISPLAY' });
  }
}

const defaultUserConstraints = {
  audio: true,
  video: {
    width: { ideal: 1280, max: 1920 },
    height: { ideal: 720, max: 1080 }
  }
};

export async function startUserCapture(dispatch, userMediaOptions = null) {
  const constraints = userMediaOptions || defaultUserConstraints;

  try {
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    stream.getTracks().forEach(track => {
      track.onended = () => {
        dispatch({ type: 'UNSHARE_USER' });
      };
    });
    dispatch({ type: 'SHARE_USER', payload: stream });
  } catch (err) {
    // TODO: there 7 types of exceptions; certainly we should differentiate here one day
    console.error('Error: ' + err);

    dispatch({ type: 'BLOCK_USER' });
  }
}

// ----------------------------------------------------------------------------

export function stopCapture({ audioStream, displayStream, userStream }, dispatch) {
  stopAudioCapture(audioStream, dispatch);
  stopDisplayCapture(displayStream, dispatch);
  stopUserCapture(userStream, dispatch);
}

export function stopAudioCapture(stream, dispatch) {
  stream && stream.getTracks().forEach(track => track.stop());
  dispatch({ type: 'UNSHARE_AUDIO' });
}

export function stopDisplayCapture(stream, dispatch) {
  stream && stream.getTracks().forEach(track => track.stop());
  dispatch({ type: 'UNSHARE_DISPLAY' });
}

export function stopUserCapture(stream, dispatch) {
  stream && stream.getTracks().forEach(track => track.stop());
  dispatch({ type: 'UNSHARE_USER' });
}

// ----------------------------------------------------------------------------

export function addAudioToStream(videoStream, audioStream, dispatch, actionType) {
  if (videoStream) {
    videoStream.getAudioTracks().forEach(track => track.stop());

    const streamWithAudio = new MediaStream([
      ...videoStream.getVideoTracks(),
      ...audioStream.getAudioTracks()
    ]);
    dispatch({ type: actionType, payload: streamWithAudio });
  }
}

export function removeAudioFromStream(stream, dispatch, actionType) {
  if (stream) {
    stream.getAudioTracks().forEach(track => track.stop());
    const streamWithoutAudio = new MediaStream([...stream.getVideoTracks()]);
    dispatch({ type: actionType, payload: streamWithoutAudio });
  }
}

// ----------------------------------------------------------------------------

export async function selectCamera(dispatch, deviceId) {
  const constraints = { ...defaultUserConstraints, video: { deviceId } };
  startUserCapture(dispatch, constraints);
}

export async function selectMicrophone(dispatch, deviceId) {
  const constraints = { ...defaultUserConstraints, audio: { deviceId } };
  startUserCapture(dispatch, constraints);
}
