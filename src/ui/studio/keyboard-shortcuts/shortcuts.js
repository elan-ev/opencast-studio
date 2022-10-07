//; -*- mode: rjsx;-*-
/** @jsx jsx */
import { jsx } from 'theme-ui';
import { useTranslation } from 'react-i18next';
import { getShortcuts } from './globalKeys';

const Group = ({name, entries}) => {
  const { t } = useTranslation();

  return (
    <div sx={{
      margin: '10px',
      display: 'flex',
      flexDirection: 'column',
      width: '420px',
    }}>
      <h3 sx={{
        borderBottom: theme => `1px solid ${theme.colors.gray[1]}`,
        textAlign: 'center',
      }}>
        {t(name)}
      </h3>
      {entries.map((entry, index) => (
        <Entry params={entry} key={index}></Entry>
      ))}
    </div>
  )
}

const Entry = ({params}) => {
  const { t } = useTranslation();

  return (
    <div sx={{
      display: 'flex',
      flexDirection: 'row',
      padding: '6px 0',
    }}>

      <div sx={{
        width: '40%',
        minWidth: '40%',
        wordWrap: 'break-word',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignContent: 'center',
      }}>
        {t(params.name)}
      </div>
        {params.description.map((description, index, arr) => (
          <div key={index}
            sx={{
              padding: '2px 0',
              alignSelf: 'center', 
              display: 'flex', 
              flexDirection: 'row',
          }}>
            {description.toString().split('+').map((singleKey, index) => (
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
              {arr.length - 1 !== index && t("sequence-seperator")}
            </div>
          </div>
        ))}

    </div>
  )
}

const KeyboardShortcuts = () => {
  const { t } = useTranslation();
  const shortcuts = getShortcuts()

  const render = () => {
    if (shortcuts && Object.keys(shortcuts).length > 0) {

      var obj = {}
      obj[t("other-shortcuts")] = []    // For keys without a group

      // Sort by group
      for (const [, value] of Object.entries(shortcuts)) {
        if (value.group) {
          if (obj[value.group]) {
            obj[value.group].push(value)
          } else {
            obj[value.group] = [value]
          }
        } else {
          obj[t("other-shortcuts")].push(value)
        }
      }

      const groups = [];
      for (const key in obj) {
        if (obj[key].length > 0) {
          groups.push(<Group name={key} entries={obj[key]} key={key}/>);
        }
      }

      return (
        <div sx={{
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}>
          {groups}
        </div>
      )
    }

    // No groups fallback
    return <div>{t('no-groups')}</div>
  }

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
      {render()}
    </div>
  )
}

export default KeyboardShortcuts;
