import React, { Component } from 'react';
import IconButton from '@material-ui/core/IconButton';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';

export default function MyIconButtonUp(props) {
    return (
        <IconButton color="secondary" aria-label="show" onClick={props.onClick} style={props.visible ? {display: 'block'} : {display: 'none'}}>
          <ArrowUpwardIcon />
        </IconButton>
    );
}
