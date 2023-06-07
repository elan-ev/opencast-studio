import { HiOutlineTranslate } from 'react-icons/hi';
import { FiInfo, FiMoon } from 'react-icons/fi';

import { COLORS } from '../color';
import { DEFINES } from '../defines';
import { useTranslation } from 'react-i18next';


export const Header: React.FC = () => (
  <div css={{
    backgroundColor: COLORS.neutral6,
    height: 64,
    display: 'flex',
    justifyContent: 'space-between',
  }}>
    <Logo />
    <Buttons />
  </div>
);

const Logo: React.FC = () => {
  const path = (filename: string) => DEFINES.publicPath
    + (DEFINES.publicPath.endsWith('/') ? '' : '/')
    + filename;

  return (
    <picture css={{
      height: '100%',
      display: 'flex',
      paddingLeft: 8,
      alignItems: 'center',
      '> *': {
        height: 'calc(100% - 12px)',
      },
    }}>
      <source media="(min-width: 920px)" srcSet={path('logo-wide.svg')} />
      <img src={path('logo-narrow.svg')} alt="Opencast Studio Logo" />
    </picture>
  );
};

const Buttons: React.FC = () => {

  return (
    <div css={{
      display: 'flex',
      gap: 16,
      height: '100%',
      alignItems: 'center',
      paddingRight: 24,
    }}>
      <LanguageButton />
      <ThemeButton />
      <InfoButton />
    </div>
  );
};

const LanguageButton: React.FC = () => {
  return (
    <HeaderButton icon={<HiOutlineTranslate />} label="Language" />
  );
};

const ThemeButton: React.FC = () => {
  const { t } = useTranslation();
  return (
    <HeaderButton icon={<FiMoon />} label={t('header.theme.label')} />
  );
};

const InfoButton: React.FC = () => {
  const { t } = useTranslation();
  return (
    <HeaderButton icon={<FiInfo />} label={t('header.info.label')} />
  );
};

type HeaderButtonProps = {
  icon: JSX.Element;
  label: string;
};

const BUTTON_LABEL_BREAKPOINT = 640;

const HeaderButton: React.FC<HeaderButtonProps> = ({ icon, label }) => (
  <button css={{
    display: 'flex',
    gap: 8,
    alignItems: 'center',

    background: 'none',
    border: 'none',
    fontSize: 16,
    color: COLORS.neutral0,
    borderRadius: 6,
    cursor: 'pointer',
    padding: 5,

    ':hover, :active': {
      outline: `2px solid ${COLORS.neutral4}`,
      backgroundColor: COLORS.neutral7,
    },

    '> svg': {
      fontSize: 22,
      [`@media (max-width: ${BUTTON_LABEL_BREAKPOINT}px)`]: {
        fontSize: 26,
      },
    }
  }}>
    {icon}
    <span css={{
      [`@media (max-width: ${BUTTON_LABEL_BREAKPOINT}px)`]: {
        display: 'none',
      },
    }}>{label}</span>
  </button>
);
