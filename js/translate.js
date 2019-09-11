import EventEmitter from './eventemitter';
import utils from './utils';

class TranslationService extends EventEmitter {
  constructor() {
    super();

    let _chosen = {};
    Object.defineProperty(this, 'chosen', {
      get: function() {
        return _chosen;
      }
    });

    let _lang;
    Object.defineProperty(this, 'language', {
      get: function() {
        return _lang;
      },
      set: function(newLang) {
        if (typeof newLang == 'string') {
          _lang = newLang;
          if (_languages) {
            _chosen = _languages
              .filter(current => _lang.indexOf(current.short) > -1)
              .reduce((chosen, check) => (chosen = check), {});
            localStorage.setItem('language', newLang);
            let emitObj = JSON.parse(JSON.stringify(_chosen));
            emitObj.language = _lang;
            emitObj.translation = this[_lang] || this.en;
            this.emit('translations.set', emitObj);
          }
        }
      }
    });

    let _languages = JSON.parse(localStorage.getItem('languagePacks') || '[]');
    Object.defineProperty(this, 'languages', {
      get: function() {
        return _languages;
      },
      set: function(langs) {
        if (langs && typeof langs == 'object') {
          _languages = langs;
          this.emit('translations.languages', langs);
          if (_lang) {
            _chosen = langs
              .filter(current => _lang.indexOf(current.short) > -1)
              .reduce((chosen, check) => (chosen = check), {});
            let emitObj = JSON.parse(JSON.stringify(_chosen));
            emitObj.language = _lang;
            emitObj.translation = this[_lang] || this.en;
            localStorage.setItem('languagePacks', JSON.stringify(langs));
            this.emit('translations.set', emitObj);
          }
        }
      }
    });

    this.getTranslations().then(() => {
      this.emit('translations.received');
    });

    this.setLanguages();

    this.language = localStorage.getItem('language') || navigator.language;
  }

  getTranslations() {
    return new Promise((resolve, reject) => {
      utils
        .xhr('/res/translations.json', {
          properties: {
            responseType: 'json'
          }
        })
        .then(translations => {
          for (let lang in translations) {
            this[lang] = {};
            for (let phrase in translations[lang]) {
              this[lang][phrase] = translations[lang][phrase];
            }
          }

          resolve();
        })
        .catch(err => reject(err));
    });
  }

  getLanguages() {
    return new Promise((resolve, reject) => {
      utils
        .xhr('/res/languages.json', {
          properties: {
            responseType: 'json'
          }
        })
        .then(languages => resolve(languages))
        .catch(err => reject(err));
    });
  }

  setLanguages() {
    this.getLanguages()
      .then(languages => (this.languages = languages))
      .catch(err => console.log(err));
  }

  setLanguage(lang) {
    this.language = lang;
  }

  translate(phrase) {
    return this[this.language][phrase] || this.en[phrase] || '';
  }
}

export default TranslationService;
