import React, { Component } from 'react';
import IconButton from '@material-ui/core/IconButton';
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';

export default function MyIconButtonDown(props) {
    return (
        <IconButton color="primary" aria-label="hide" onClick={props.onClick}>
          <ArrowDownwardIcon />
        </IconButton>
    );
}
