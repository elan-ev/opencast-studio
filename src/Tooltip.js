//; -*- mode: rjsx;-*-
/** @jsx jsx */
import { jsx } from 'theme-ui';

import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import './style/global-style';

const Tooltip = ({ content, ...props }) => (

    <Tippy 
        content = { <span> {content} </span> }
        interactive={true}
        delay={300}
        theme='studio'

        sx={{
            fontSize: '16px',
            backgroundColor: '#43a472',
            color: 'white',
            lineHeight: 'normal',
            fontFamily: 'Open Sans',
        }}
        
        {...props}
    >       
        <span> { props.children} </span>
    </Tippy>
);

export default Tooltip;