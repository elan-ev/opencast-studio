//; -*- mode: rjsx;-*-
/** @jsx jsx */
import { jsx } from 'theme-ui';
import { useTranslation } from 'react-i18next';
import { getShortcuts } from './globalKeys';

const Group = ({ name, entries }) => {
  const { t } = useTranslation();

  return (
    <div sx={{
      margin: '10px',
      display: 'flex',
      flexDirection: 'column',
      '@media screen and (max-width: 350px)': {
        width: '300px',
      }
    }}>
      <h3 sx={{
        borderBottom: theme => `1px solid ${theme.colors.gray[1]}`,
        textAlign: 'center',
      }}>
        {t(name)}
      </h3>
      { entries.map((entry, index) => (
        <Entry params={entry} key={index}></Entry>
      ))}
    </div>
  );
};

const Entry = ({ params }) => {
  const { t } = useTranslation();

  return (
    <div sx={{
      display: 'flex',
      flexDirection: 'row',
      padding: '6px 0',
      alignItems: 'center'
    }}>

      <div sx={{
        width: '40%',
        wordWrap: 'break-word',
      }}>
        {t(params.name)}
      </div>
      { params.description.map((description, index, arr) => (
        <div key={index}
          sx={{
            padding: '2px 0',
            display: 'flex',
          }}>
          { description.toString().split('+').map((singleKey, index) => (
            <div key={index}
              sx={{
                borderRadius: '5px',
                border: theme => `2px solid ${theme.colors.singleKey_border}`,
                background: theme => theme.colors.singleKey_bg,
                padding: '8px',
                margin: '0 3px',
                textAlign: 'center',
                minWidth: '40px',
              }}>
              {t(singleKey)}
            </div>
          ))}
          <div sx={{ alignSelf: 'center', lineHeight: '32px', margin: '0 5px' }}>
            { arr.length - 1 !== index && t("sequence-seperator") }
          </div>
        </div>
      ))}

    </div>
  );
};

const KeyboardShortcuts = () => {
  const { t } = useTranslation();
  const shortcuts = getShortcuts();

  let obj = {};

  if (shortcuts && Object.keys(shortcuts).length > 0) {
    // Sort by group
    for (const value of Object.values(shortcuts)) {
      const key = value.group ?? t("other-shortcuts");
      if (!(key in obj)) {
        obj[key] = [];
      }
      obj[key].push(value);
    }
  }

  const groups = Object.entries(obj)
    .filter(([_, value]) => value.length > 0)
    .map(([key, value]) => <Group name={key} key={key} entries={value} />);

  return (
    <div sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      alignSelf: 'center',
      width: '100%',
    }}>
      <h2 sx={{
        display: 'block',
        position: 'relative',
        textAlign: 'center',
      }}>
        {t('nav-shortcuts')}
      </h2>

      <div sx={{
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
      }}>
        { groups }
      </div>

    </div>
  );
};

export default KeyboardShortcuts;
