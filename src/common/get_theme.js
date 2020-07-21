// theme
import { createMuiTheme } from '@material-ui/core/styles';

export default function getTheme() {
  return createMuiTheme({
    palette: {
      type: 'dark',
      primary: {
        main: '#aa00ff',
      },
      secondary: {
        main: '#ea80fc',
      },
      background: {
        default: '#000000',
        paper: '#121212',
      },
    },
  });
}
