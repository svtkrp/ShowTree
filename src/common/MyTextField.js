import React from 'react';
import TextField from '@material-ui/core/TextField';

export default function MyTextField(props) {
  return (
        <TextField
          style={{width: '100%'}}
          id="text-field"
          label="Дерево в JSON-формате"
          multiline
          rows={4}
          variant="outlined"
          value={props.value}
          onChange={props.onChange}
        /> );
}
