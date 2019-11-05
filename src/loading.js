//; -*- mode: rjsx;-*-
/** @jsx jsx */
import { jsx } from 'theme-ui';
import css from '@emotion/css/macro';

const Loading = props => {
  return (
    <div
      css={css`
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        text-align: center;
        width: 12rem;
        height: 12rem;
        transition: opacity 0.5s 0.5s, visibility 0s 1s;
      `}
    >
      <span
        css={css`
          text-align: center;
          position: absolute;
          max-width: 80%;
          max-height: 80%;
          transform: translate(-50%, -50%);
          top: 50%;
          left: 50%;
          position: absolute;
          font-style: italic;
          font-size: 1.25rem;
          color: #666;
        `}
      >
        Loading...
      </span>
    </div>
  );
};

export default Loading;
