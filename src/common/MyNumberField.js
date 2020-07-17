import React, { Component } from 'react';
import TextField from '@material-ui/core/TextField';

export default function MyNumberField(props) {

    return (
        <TextField
          id="number-field"
          variant="outlined"
          color="secondary"
          size="small"
          label="Введите значение узла"
          type="number"
          InputLabelProps={{
            shrink: true,
          }}
          onChange={props.onChange}
          value={props.value}
          disabled={props.disabled}
        />
    );
}
