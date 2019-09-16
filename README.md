Opencast Studio
===============

[![Build Status](https://travis-ci.com/elan-ev/opencast-studio.svg?branch=master)
](https://travis-ci.com/elan-ev/opencast-studio)

Web based audio/video studio using random devices lying around your house, with direct upload to Opencast.

Demo at <https://studio.opencast.org>

### Contents

### Introduction
Record your webcam, microphone, desktop (chrome: requires extension) or any mediastream sourced via WebRTC.

1. Configure your Opencast server by using the button in the top right (gear symbol).
2. Enable the devices you want to record, by clicking the huge buttons and allowing the access.
3. Click the recording button to start the recording. A window will open.
4. Click the stop button to finish the recording.
5. Set the title and the moderator and click the 'Upload media to Opencast' button to start the upload in the background. The Upload takes some time, please wait.
6. After the upload is finished the window closes.

### Installation

Just serve the files of this repository over https (needed). The application needs to be the root of a domain to work.

If you want to use your own Opencast server with this software, you need to allow CORS requests (with credentials) to your Opencast server. Additionally you need a workflow, which inspects the media and updates the length information.
