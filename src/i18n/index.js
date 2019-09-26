import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// the translations
// (tip move them in a JSON file and import them)
const resources = {
  en: {
    translation: {
      'about-us': 'about us',
      'message-conn-failed':
        'The Internet Connection failed or you are missing necessary permissions.',
      'message-login-failed': 'Login failed, Please check your Password!',
      'message-server-unreachable':
        'Server unreachable: Check your Internet Connetion and the Server Url, also check whether your Opencast Instance supports this site.',
      'message-upload-complete': 'Upload complete!',
      'pause-button-title': 'Pause recording',
      'record-button-title': 'Start/resume recording',
      'save-creation-button-discard': 'Discard',
      'save-creation-button-save': 'Save media',
      'save-creation-button-upload': 'Upload to Opencast',
      'save-creation-form-invalid': 'Please set Title and Presenter',
      'save-creation-label-media': 'Media',
      'save-creation-label-presenter': 'Presenter',
      'save-creation-label-title': 'Title',
      'save-creation-modal-title': 'Production Details',
      'share-desktop': 'Share desktop (no audio)',
      'share-webcam': 'Share webcam (with microphone audio)',
      'state-paused': 'Paused',
      'state-recording': 'Recording',
      'state-waiting': 'Waiting',
      'stop-button-title': 'Stop recording',
      'toolbar-button-about': 'About Opencast Studio',
      'toolbar-button-issues': 'Report Issue',
      'toolbar-button-opencast': 'Go to Opencast',
      'toolbar-button-upload-settings': 'Open Upload Settings',
      'upload-settings-modal-title': 'Opencast Upload Settings'
    }
  },

  de: {
    translation: {
      'about-us': 'Impressum',
      'message-conn-failed': 'Probleme mit der Internet-Verbindung oder fehlende Berechtigungen.',
      'message-login-failed': 'Login fehlgeschlagen. Bitte Passwort überprüfen!',
      'message-server-unreachable':
        'Der Server ist nicht zu erreichen: Überprüfen Sie Ihre Internet-Verbindung und die Server-URL! Prüfen Sie auch die Konfiguration Ihrer Opencast-Installation.',
      'message-upload-complete': 'Erfolgreich hochgeladen!',
      'pause-button-title': 'Aufzeichnung pausieren',
      'record-button-title': 'Aufzeichnung beginnen/fortsetzen',
      'save-creation-button-discard': 'Abbrechen',
      'save-creation-button-save': 'Medien herunterladen',
      'save-creation-button-upload': 'In Opencast hochladen',
      'save-creation-form-invalid': 'Bitte setzen sie den Titel und den*die Vortragende*n',
      'save-creation-label-media': 'Medien',
      'save-creation-label-presenter': 'Vortragende*r',
      'save-creation-label-title': 'Titel',
      'save-creation-modal-title': 'Produktionsdetails',
      'share-desktop': 'Bildschirm teilen (ohne Audio)',
      'share-webcam': 'Webcam teilen (mit Mikrophon-Audio)',
      'state-paused': 'Pause',
      'state-recording': 'Aufnahme',
      'state-waiting': 'Warten',
      'stop-button-title': 'Aufzeichnung beenden',
      'toolbar-button-about': 'Über Opencast Studio',
      'toolbar-button-issues': 'Problem berichten',
      'toolbar-button-opencast': 'Zu Opencast',
      'toolbar-button-upload-settings': 'Einstellungen für das Hochladen öffnen',
      'upload-settings-modal-title': 'Einstellungen für das Hochladen'
    }
  }
};

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources,
    fallbackLng: 'en',

    keySeparator: false, // we do not use keys in form messages.welcome

    interpolation: {
      escapeValue: false // react already safes from xss
    }
  });

export default i18n;
