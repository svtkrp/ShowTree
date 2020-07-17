import React, { Component } from 'react';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';

function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

export default function MyAlert(props) {
    return (
        <Snackbar open={props.open} autoHideDuration={3000} onClose={props.onClose} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <Alert severity={props.severity} onClose={props.onClose}>
          {props.text}
        </Alert>
      </Snackbar>
    );
}
