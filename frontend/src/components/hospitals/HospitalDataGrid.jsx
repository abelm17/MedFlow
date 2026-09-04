import { useEffect, useState } from "react";
import {DataGrid} from '@mui/x-data-grid';
import { Alert, Box, CircularProgress, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Stack, TextField } from "@mui/material";
import apiClient from "../../api/client";
import { useAuth } from "../../context/AuthContext.jsx"
import { hasRole } from "../../permissions.js";

const ADMIN= "Clinical Admin"
const TECHNICIAN= "Field Technician"
const AUDITOR= "Auditor"

const columns= [
    {field: 'id', headerName: 'ID', width: 70},
    {field: 'name', headerName: 'Hospital Name', widht: 150},
    {field: 'location_region', headerName: 'Location Region', width: 160},
    {field: 'capacity', headerName: 'Capacity', width: 120, type: 'number'},
    {field: 'supervisor_id', headerName: 'Supervisor ID', width: 130},
    {}
];


function HospitalDataGrid({onSuccess}){
    const { user } = useAuth();

    const [hospitals, setHospital]= useState([]);
    const [loading, setLoading]= useState(true);
    const [error, setError]= useState(null);
    const [dialogOpen, setDialogOpen]= useState(false);
    const [formValues, setFormValues]= useState({
        name: '',
        location_region: '',
        capacity: '',
        supervisor_id: '',
    });
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleteHospitalId, setDeleteHospitalId] = useState('');
    const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
    const [updateHospitalId, setUpdateHospitalId] = useState('');

    async function fetchHospitals(){
        setLoading(true);
        try{
            const response= await apiClient.get('/hospitals');
            setHospital(response.data);
            setError(null);
        } catch{
            setError('Could not load hospital data');
        } finally{
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchHospitals();
    }, []);

    const handleFieldChange= (field) => event => {
        setFormValues((prev) => ({ ...prev, [field]: event.target.value}))
    }

    const handleCreate= async () => {
        try {
            await apiClient.post('/hospitals', {
                ...formValues,
                capacity: Number(formValues.capacity_level),
                supervisor_id: Number(formValues.supervisor_id),
            });
            setDialogOpen(false);
            setFormValues({name: '', location_region: '', capacity: '', supervisor_id: ''});
            onSuccess(`Hospital ${formValues.name} was created.`);
            await fetchHospitals();
        } catch {

        }
    }

    const handleDelete= async () => {
        try {
            await apiClient.delete(`/hospitals/${deleteHospitalId}`);

            setDeleteDialogOpen(false);
            onSuccess(`Hospital ${deleteHospitalId} was deleted`);
            setDeleteHospitalId('');
            await fetchHospitals();
            
        } catch {
            setError(`Could not delete hospital ${deleteHospitalId}`)
        }
    }

    const handleUpdate= async () => {
        try {
            await apiClient.patch('/hospitals', {
                ...formValues,
                capacity: Number(formValues.capacity_level),
                supervisor_id: Number(formValues.supervisor_id),
            });
            setUpdateDialogOpen(false);
            setFormValues({name: '', location_region: '', capacity: '', supervisor_id: ''});
            onSuccess(`Hospital ${formValues.name} was updated.`);
            await fetchHospitals();
        } catch {
            setError(`Could not update hospital ${updateHospitalId}`)
        }
    }

    if (loading) return <CircularProgress />

    return (
        <Box>
            {error && (
                <Alert serverity= "error" onClose={() => setError(null)}>{error}</Alert>
            )}
            {hasRole(user, ADMIN) && (
                <>
                    <Button variant= "outlined" sx= {{ mb: 2}} onClick= {() => setDialogOpen(true)}>Add Hospital</Button>
                    <Button variant= "outlined" sx= {{ mb: 2}} onClick= {() => setUpdateDialogOpen(true)}>Update Hospital</Button>
                    <Button variant= "outlined" sx= {{ mb: 2}} onClick= {() => setDeleteDialogOpen(true)}>Delete Hospital</Button>
                </>
            )}
            <Box sx={{height: 400, width: '100%'}}>
                <DataGrid rows= {hospitals} columns= {columns} getRowId={(row) => row.id} />
            </Box>

            <Dialog open= {dialogOpen} onClose= {() => setDialogOpen(false)}>
                <DialogTitle>Add New Hospital</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx= {{ mt: 1, minWidth: 300}}>
                        <TextField label= "Name" value= {formValues.name} onChange= {handleFieldChange('name')} />
                        <TextField label= "Location Region" value= {formValues.location_region} onChange={handleFieldChange('location_region')} />
                        <TextField label= "Capacity" type= "number" value= {formValues.capacity} onChange={handleFieldChange('capacity')} />
                        <TextField label= "Supervisor ID" type= "number" value= {formValues.supervisor_id} onChange={handleFieldChange('supervisor_id')} />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
                    <Button variant= "contained" onClick={handleCreate}>Create</Button>
                </DialogActions>
            </Dialog>

            <Dialog open= {updateDialogOpen} onClose= {() => setUpdateDialogOpen(false)}>
                <DialogTitle>Update Hospital</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx= {{ mt: 1, minWidth: 300}}>
                        <TextField label= "Name" value= {formValues.name} onChange= {handleFieldChange('name')} />
                        <TextField label= "Location Region" value= {formValues.location_region} onChange={handleFieldChange('location_region')} />
                        <TextField label= "Capacity" type= "number" value= {formValues.capacity} onChange={handleFieldChange('capacity')} />
                        <TextField label= "Supervisor ID" type= "number" value= {formValues.supervisor_id} onChange={handleFieldChange('supervisor_id')} />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setUpdateDialogOpen(false)}>Cancel</Button>
                    <Button variant= "contained" onClick={handleUpdate}>Create</Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
            >
                <DialogTitle>Delete Hospital</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Hospital ID"
                        type="number"
                        fullWidth
                        value={deleteHospitalId}
                        onChange={(event) =>
                            setDeleteHospitalId(event.target.value)
                        }
                    />
                </DialogContent>

                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>
                        Cancel
                    </Button>

                    <Button
                        variant="contained"
                        color="error"
                        disabled={!deleteHospitalId}
                        onClick={handleDelete}
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

        </Box>
    );
}

export default HospitalDataGrid;