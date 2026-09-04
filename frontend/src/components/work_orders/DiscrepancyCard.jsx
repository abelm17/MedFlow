import {Card, CardContent, Typography, Stack, Alert} from '@mui/material'

function DiscrepancyCard({discrepancy}) {
    

    return (
        <Card variant= "outlined" sx= {{minWidth: 280}}>
            <CardContent>
                <Typography variant="h6" component="div">
                    {discrepancy.title}
                </Typography>
                <Typography color= "text.secondary" gutterBottom>
                    Work Order #{discrepancy.workOrderId}
                </Typography>
                <Stack spacing={0.5} sx={{ mb: 1.5}}>
                    <Typography variant= "body2">
                        Equipment Facility: {discrepancy.equipmentFacilityId}
                    </Typography>
                    <Typography>
                        Technician Facility: {discrepancy.technicianFacilityId}
                    </Typography>
                </Stack>
                <Alert severity='warning'>
                    Facility Mismatch Detected
                </Alert>
            </CardContent>
        </Card>
    )
}

export default DiscrepancyCard;