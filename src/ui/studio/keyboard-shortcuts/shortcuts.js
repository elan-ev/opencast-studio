//; -*- mode: rjsx;-*-
/** @jsx jsx */
import { jsx } from 'theme-ui';
import { useTranslation } from 'react-i18next';
import { keyMap } from './globalKeys';


const Group = ({name, entries}) => {

  const { t } = useTranslation();

  return (
    <table sx={{
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      maxWidth: '480px',
      margin: '10px',
    }}>
      <th sx={{
        borderBottom: theme => `1px solid ${theme.colors.gray[1]}`,
        fontSize: '1.17em', // h3-size
      }}>
        {t(name)}
      </th>
        {entries.map((entry, index) => (
          <Entry params={entry} key={index}></Entry>
        ))}
    </table>
  )
}

const Entry = ({params}) => {

  const { t } = useTranslation();

  return (
    <tr sx={{
      display: 'flex',
      flexDirection: 'row',
      padding: '5px 0',
    }}>
    <td sx={{
      alignSelf: 'center',
      width: '33%',
      minWidth: '33%',
      height: '5em',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      wordWrap: 'break-word',
      paddingLeft: '10px',
      marginRight: '5px',
      // Center text vertically
      display: 'flex',
      justifyContent: 'center',
      alignContent: 'center',
      flexDirection: 'column',
    }}>
      {t(params.name)}
    </td>
    {Array.from(params.description).map((description, index, arr) => (
      <td key={index}
        sx={{ alignSelf: 'center', display: 'flex', flexDirection: 'row' }}
      >
        {description.toString().split('+').map((singleKey, index) => (
          <div key={index}
            sx={{
              borderRadius: '5px',
              border: theme => `2px solid ${theme.colors.singleKey_border}`,
              background: theme => theme.colors.singleKey_bg,
              padding: '10px',
              margin: '0 5px',
              textAlign: 'center',
              minWidth: '45px',
            }}
          >
            {t(singleKey)}
          </div>
        ))}
        <div sx={{ alignSelf: 'center', lineHeight: '32px', margin: '0 5px' }}>
          {arr.length - 1 !== index && t("sequence-seperator")}
        </div>
      </td>
    ))}  
    </tr>
  )
}

const KeyboardShortcuts = () => {

  const { t } = useTranslation();
  
  const render = () => {
    if (keyMap && Object.keys(keyMap).length > 0) {
      var obj = {}
      obj[t("other-shortcuts")] = []    // For keys without a group

      // Sort by group
      for (const [, value] of Object.entries(keyMap)) {
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
      <h2>
        {t('nav-shortcuts')}
      </h2>
      {render()}
    </div>
  );
}

export default KeyboardShortcuts;
