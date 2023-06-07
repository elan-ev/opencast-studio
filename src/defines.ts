
// Values passed in via the `DefinePlugin` (see webpack config)
declare const DEFINE_PUBLIC_PATH: string | null;
declare const DEFINE_SETTINGS_PATH: string | null;


export const DEFINES = {
  publicPath: DEFINE_PUBLIC_PATH ?? '/',
  settingsPath: DEFINE_SETTINGS_PATH,
};
