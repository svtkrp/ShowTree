import React from 'react';
import ReactDOM from 'react-dom';
import Typography from '@material-ui/core/Typography';
import { ThemeProvider } from '@material-ui/styles';

import Menu from './menu';
import getTheme from '../common/get_theme.js';

ReactDOM.render(
  <ThemeProvider theme={getTheme()}>
  <div>
    <Typography component='h1' variant="h2" gutterBottom align='center' >
      Show me tree!
    </Typography>
    <Typography component='h2' variant="h3" gutterBottom align='center' >
      Визуализация различных деревьев и алгоритмов для них
    </Typography>
    <Menu />
  </div>
  </ThemeProvider>, 
document.getElementById('root'));
