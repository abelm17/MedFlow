import { AppBar, Toolbar, Typography, Box, Button } from '@mui/material';
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing';

function AppHeader({username, role, onLogout}) {
    return(
        <AppBar position="static">
            <Toolbar>
                <PrecisionManufacturingIcon sx= {{mr: 2}} />
                <Typography variant='h6' component="h1">
                    MedFlow Clinical Equipment Command Center
                </Typography>
                {username && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2}}>
                        <Typography variant='body2'>{username}({role})</Typography>
                        <Button color="inherit" onClick={onLogout}>Log Out</Button>
                    </Box>
                )}
            </Toolbar>
        </AppBar>
    )
}

export default AppHeader