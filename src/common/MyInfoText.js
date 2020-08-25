import React, { Component } from 'react';
import Typography from '@material-ui/core/Typography';

export default function MyInfoText(props) {
    return (
        <div><Typography variant="body1" color='secondary' style={{display: 'block'}}>
          {props.text}
        </Typography></div>
    );
}
