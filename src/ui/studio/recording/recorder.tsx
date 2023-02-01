import { Settings } from '../../../settings';
import { dimensionsOf } from '../../../util';


export type OnStopCallback = (args: {
  url: string,
  media: Blob,
  mimeType: string,
  dimensions: [number, number] | null,
}) => void;

export default class Recorder {
  #recorder: MediaRecorder;
  #data: Blob[] = [];
  #dimensions: [number, number] | null;

  onStop: OnStopCallback;

  constructor(
    stream: MediaStream,
    settings: Settings['recording'],
    onStop: OnStopCallback,
  ) {
    // Figure out MIME type.
    let mimeType: string | undefined;
    if ('isTypeSupported' in MediaRecorder) {
      mimeType = (settings?.mimes || [])
        .find(mime => MediaRecorder.isTypeSupported(mime));
      if (mimeType) {
        console.debug('using first supported MIME type from settings: ', mimeType);
      } else if (settings?.mimes) {
        console.debug('None of the MIME types specified in settings are supported by '
          + 'this `MediaRecorder`');
      }
    } else if (settings?.mimes) {
      console.debug('MIME types were specified, but `MediaRecorder.isTypeSupported` is not '
        + 'supported by your browser');
    }


    this.#reset();

    this.#dimensions = dimensionsOf(stream);
    this.onStop = onStop;

    const videoBitsPerSecond = settings?.videoBitrate;
    this.#recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond });
    this.#recorder.ondataavailable = this.#onDataAvailable;
    this.#recorder.onstop = this.#onStop;
  }

  #reset = () => {
    this.#data = [];
  }

  #onDataAvailable = (event: BlobEvent) => {
    if (event.data.size > 0) {
      this.#data.push(event.data);
    } else {
      console.log('Recording data has size 0!', event);
    }
  }

  #onStop = (_event: Event) => {
    const mimeType = this.#data[0]?.type || this.#recorder.mimeType;
    const media = new Blob(this.#data, { type: mimeType });
    const url = URL.createObjectURL(media);

    this.#reset();

    this.onStop?.({ url, media, mimeType, dimensions: this.#dimensions });
  }

  start() {
    this.#recorder.start();
  }

  pause() {
    this.#recorder.pause();
  }

  resume() {
    this.#recorder.resume();
  }

  stop() {
    this.#recorder.stop();
  }
}
