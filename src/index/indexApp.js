import React from 'react';
import ReactDOM from 'react-dom';
import Typography from '@material-ui/core/Typography';
import Menu from './menu';

ReactDOM.render(
  <div>
    <Typography component='h1' variant="h2" gutterBottom align='center' >
      Show me tree!
    </Typography>
    <Typography component='h2' variant="h3" gutterBottom align='center' >
      Визуализация различных деревьев и алгоритмов для них
    </Typography>
    <Menu />
  </div>, document.getElementById('root'));
