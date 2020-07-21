import React, { Component } from 'react';
import Typography from '@material-ui/core/Typography';

export default function MyControlText(props) {
    return (
        <Typography variant="caption" color='secondary' gutterBottom style={props.controlTextOpen ? {display: 'block', position: 'relative', paddingLeft: '5px', marginLeft: '0%', paddingTop: '5px', paddingBottom: '5px'} : {display: 'none'}}>
          левая кнопка мыши - вращение, правая - передвижение камеры, колесико - приближение/отдаление камеры
        </Typography>
    );
}
