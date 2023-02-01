// Unfortunately, `react-hotkeys` refers to `SFC` and causes a compiler error.
// So we just declare it here. `SFC` used to be the same as `FunctionComponent`
// before it was deleted. So this is completely safe to define. More info:
//
// https://github.com/DefinitelyTyped/DefinitelyTyped/pull/30364
import * as React from 'react';
declare module 'react' {
  export type SFC<P> = React.FunctionComponent<P>;
}
