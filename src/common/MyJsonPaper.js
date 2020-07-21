import React, { Component } from 'react';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import MyButton from '../common/MyButton.js';
import MyTextField from '../common/MyTextField.js';
import './main.css';

export default function MyJsonPaper(props) {
    return (
        <Paper className={props.jsonOpen ? "jsonPaper" : "hided"}>
          <Grid container direction="column" justify="center" alignItems="flex-start" spacing={1}>
            <Grid item style={{width: '100%'}}><MyTextField value={props.jsonValue} onChange={props.onChange} /></Grid>
            <Grid item><MyButton name="Визуализировать" onClick={props.onClick} disabled={props.setJsonDisabled} /></Grid>
          </Grid>
        </Paper>
    );
}
