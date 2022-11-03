import { createMuiTheme } from '@material-ui/core/styles';

// Create a theme instance.
export const theme = createMuiTheme({
    palette: {
        primary: {
            main: '#01c38d',
        },
        secondary: {
            main: '#19857b',
        },
        error: {
            main: '#f44336',
        }
    },
    typography: {
        allVariants: {
            color: '#fff',
        }
    }
});
