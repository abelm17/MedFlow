import {Grid} from '@mui/material';
import DiscrepancyCard from './DiscrepancyCard.jsx';

function DiscrepancyList({discrepancies}) {
    return (
        <Grid container spacing = {2}>
            {discrepancies.map((discrepancy)=> (
            <Grid key={discrepancy.workOrderId} size={{ xs: 12, sm: 6, md: 4 }}>
                <DiscrepancyCard discrepancy={discrepancy} />
            </Grid>
            ))}
        </Grid>
    );
}

export default DiscrepancyList;
