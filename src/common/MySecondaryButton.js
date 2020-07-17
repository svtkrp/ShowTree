import React, { Component } from 'react';
import Button from '@material-ui/core/Button';

export default function MySecondaryButton(props) {
    return (
        <Button variant="contained" color="secondary" onClick={props.onClick} style={{ marginLeft: 12 }} disabled={props.disabled}>
          {props.name}
        </Button>
    );
}
