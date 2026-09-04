import {createTheme} from '@mui/material/styles'

const theme= createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#43cd81'
        },
        secondary: {
            main: '#d42222'
        },
    },
    shape: {
        borderRadius: 8,
    }
});

export default theme;
