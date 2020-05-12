const mergeHeightConstraint = (maxHeight, videoConstraints, fallbackIdeal) => {
  const maxField = maxHeight && { max: maxHeight };
  const ideal = videoConstraints?.height?.ideal || fallbackIdeal;
  const idealField = ideal && (maxHeight ? { ideal: Math.min(ideal, maxHeight) } : { ideal });

  return { height: { ...maxField, ...idealField } };
};

export async function startAudioCapture(dispatch, deviceId = null) {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: deviceId ? { deviceId } : true,
      video: false
    });
    stream.getTracks().forEach(track => {
      track.onended = () => {
        dispatch({ type: 'AUDIO_UNEXPETED_END' });
      };
    });

    dispatch({ type: 'SHARE_AUDIO', payload: stream });
  } catch (err) {
    // TODO: there several types of exceptions; certainly we should differentiate here one day
    console.error('Error: ' + err);

    dispatch({ type: 'BLOCK_AUDIO' });
  }
}

export async function startDisplayCapture(dispatch, settings, videoConstraints = {}) {
  const maxFps = settings.display?.maxFps
    ? { frameRate: { max: settings.display.maxFps } }
    : {};
  const height = mergeHeightConstraint(settings.display?.maxHeight, videoConstraints);

  const constraints = {
    video: {
      cursor: 'always',
      ...maxFps,
      ...videoConstraints,
      ...height,
    },
    audio: false,
  };

  try {
    const stream = await navigator.mediaDevices.getDisplayMedia(constraints);
    stream.getTracks().forEach(track => {
      track.onended = () => {
        dispatch({ type: 'DISPLAY_UNEXPETED_END' });
      };
    });

    dispatch({ type: 'SHARE_DISPLAY', payload: stream });
  } catch (err) {
    // TODO: there 7 types of exceptions; certainly we should differentiate here one day
    console.error('Error: ' + err);

    dispatch({ type: 'BLOCK_DISPLAY' });
  }
}

export async function startUserCapture(dispatch, settings, videoConstraints) {
  const maxFps = settings.camera?.maxFps
    ? { frameRate: { max: settings.camera.maxFps } }
    : {};
  const height = mergeHeightConstraint(settings.camera?.maxHeight, videoConstraints, 1080);

  const constraints = {
    video: {
      facingMode: 'user',
      ...videoConstraints,
      ...maxFps,
      ...height,
    },
    audio: false,
  };

  try {
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    stream.getTracks().forEach(track => {
      track.onended = () => {
        dispatch({ type: 'USER_UNEXPETED_END' });
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
  stream?.getTracks().forEach(track => track.stop());
  dispatch({ type: 'UNSHARE_AUDIO' });
}

export function stopDisplayCapture(stream, dispatch) {
  stream?.getTracks().forEach(track => track.stop());
  dispatch({ type: 'UNSHARE_DISPLAY' });
}

export function stopUserCapture(stream, dispatch) {
  stream?.getTracks().forEach(track => track.stop());
  dispatch({ type: 'UNSHARE_USER' });
}
