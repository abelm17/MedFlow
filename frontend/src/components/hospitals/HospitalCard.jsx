import { Card, CardContent, Typography, Chip, Stack } from '@mui/material'

function HospitalCard({ hospital }) {

    return (
        <Card variant='outlined' sx= {{ minWidth: 240}}>
            <CardContent>
                <Typography variant='h6' component= "div">
                    {hospital.name}
                </Typography>
                <Typography color= "text.secondary" gutterBottom>
                    {hospital.location_region}
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                    <Chip 
                        label= {`${hospital.batteryLevel}% battery`}
                        color= {isLowBattery ? 'error' : 'success'}
                        size="small"
                    />
                    <Chip label= {hospital.status} variant="outlined" size="small" />
                </Stack>
            </CardContent>
        </Card>
    );
}

export default HospitalCard;