// Checks if we app is running on a mobile device.
//
// This check could be more exhaustive, but this includes all browser we
// officially support.
export const onMobileDevice = () =>
  /Android|iPhone|iPad|iPod/i.test(navigator.platform) ||
  /Android/i.test(navigator.userAgent);

// Checks if the client supports capturing the device's display (or individual
// windows).
//
// Detecting whether display capture is supported is hard. There is currently
// no proper solution. See these two links for more information:
// - https://stackoverflow.com/q/58842831/2408867
// - https://github.com/w3c/mediacapture-screen-share/issues/127
//
// To work around this problem, we simply check if the browser runs on a
// mobile device. Currently, no mobile device/browser supports display
// capture. However, this will probably change in the future, so we have to
// revisit this issue again. This is tracked in this issue:
// https://github.com/elan-ev/opencast-studio/issues/204
export const isDisplayCaptureSupported = () =>
  "mediaDevices" in navigator &&
  "getDisplayMedia" in navigator.mediaDevices &&
  !onMobileDevice();

// Checks if the client supports capturing "user devices" (usually webcams or
// phone cameras).
export const isUserCaptureSupported = () =>
  'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices;
