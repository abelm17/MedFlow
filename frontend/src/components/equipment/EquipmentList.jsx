import {Grid} from '@mui/material';
import EquipmentCard from './EquipmentCard';

function EquipmentList({equipments}) {
    return(
        <Grid container spacing = {2}>
            {equipments.map((equipment) => (
                <Grid item key={equipment.id} size ={{ xs: 12, sm: 6, md: 4}}>
                    <EquipmentCard equipment= {equipment} />
                </Grid>
            ))}
        </Grid>
    );
}

export default EquipmentList;