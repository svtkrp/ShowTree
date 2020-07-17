import React, { Component } from 'react';
import Button from '@material-ui/core/Button';

export default function MyButton(props) {
    return (
        <Button variant="contained" color={props.color == null ? "primary" : props.color} onClick={props.onClick} disabled={props.disabled} style={props.style} >
          {props.name}
        </Button>
    );
}
