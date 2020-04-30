import { dimensionsOf } from './util.js';

export default class Recorder {
  constructor(stream, settings, options = {}) {
    // Figure out MIME type.
    let mimeType;
    if ('isTypeSupported' in MediaRecorder) {
      mimeType = (settings?.mimes || [])
        .find(mime => MediaRecorder.isTypeSupported(mime));
      if (mimeType) {
        console.debug("using first supported MIME type from settings: ", mimeType);
      } else if (settings?.mimes) {
        console.debug("None of the MIME types specified in settings are supported by "
          + "this `MediaRecorder`");
      }
    } else if (settings?.mimes) {
      console.debug("MIME types were specified, but `MediaRecorder.isTypeSupported` is not "
        + "supported by your browser");
    }


    const dimensions = dimensionsOf(stream);
    const videoBitsPerSecond = settings?.videoBitrate;

    const recData = [];
    this.recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond });
    this.recorder.ondataavailable = e => {
      if (e.data.size > 0) {
        recData.push(e.data);
      } else {
        console.log("Recording data has size 0! ", e);
      }
    };

    this.recorder.onstop = () => {
      const mimeType = recData[0]?.type || this.recorder.mimeType;
      const media = new Blob(recData, { type: mimeType });
      const url = URL.createObjectURL(media);

      // Reset this state.
      this.recorder = null;
      this.isRecording = false;

      options.onStop?.({ url, media, mimeType, dimensions });
    };

    this.isRecording = false;
    this.isPaused = false;
  }

  start() {
    if (!this.isRecording) {
      this.recorder.start();
      this.isRecording = true;
    }
  }

  pause() {
    if (!this.isPaused) {
      this.recorder.pause();
      this.isPaused = true;
    }
  }

  resume() {
    if (this.isPaused) {
      this.recorder.resume();
      this.isPaused = false;
    }
  }

  stop() {
    if (this.isRecording) {
      this.recorder.stop();
    }
  }
}
