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
    {field: 'serial_number', headerName: 'Serial Number', widht: 150},
    {field: 'model', headerName: 'Model', width: 160},
    {field: 'charge_level', headerName: 'Battery %', width: 120, type: 'number'},
    {field: 'status', headerName: 'Status', width: 130},
    {field: 'facility_id', headerName: 'Hospital ID', width: 110, type: 'number'},
    {}
];

const STATUS_OPTIONS= ['Available', 'In-Use', 'Maintenance', 'Offline'];

function EquipmentDataGrid({onSuccess}){
    const { user } = useAuth();

    const [equipment, setEquipment]= useState([]);
    const [loading, setLoading]= useState(true);
    const [error, setError]= useState(null);
    const [dialogOpen, setDialogOpen]= useState(false);
    const [formValues, setFormValues]= useState({
        serial_number: '',
        model: '',
        charge_level: '',
        facility_id: '',
        status: '',
    });
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleteEquipmentId, setDeleteEquipmentId] = useState('');
    const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
    const [updateEquipmentId, setUpdateEquipmentId] = useState('');

    async function fetchEquipment(){
        setLoading(true);
        try{
            const response= await apiClient.get('/equipment');
            setEquipment(response.data);
            setError(null);
        } catch{
            setError('Could not load equipment data');
        } finally{
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchEquipment();
    }, []);

    const handleFieldChange= (field) => event => {
        setFormValues((prev) => ({ ...prev, [field]: event.target.value}))
    }

    const handleCreate= async () => {
        try {
            await apiClient.post('/equipment', {
                ...formValues,
                charge_level: Number(formValues.charge_level),
                facility_id: Number(formValues.facility_id),
            });
            setDialogOpen(false);
            setFormValues({serial_number: '', model: '', charge_level: '', facility_id: '', status: 'Idle'});
            onSuccess(`Equipment ${formValues.serial_number} was created.`);
            await fetchEquipment();
        } catch {
            setError('Could not create equipment');
        }
    }

    const handleUpdate= async () => {
        try {
            await apiClient.patch(`/equipment/${updateEquipmentId}`, {
                ...formValues,
                charge_level: Number(formValues.charge_level),
                facility_id: Number(formValues.facility_id),
            });
            setUpdateDialogOpen(false);
            setUpdateEquipmentId('');
            setFormValues({serial_number: '', model: '', charge_level: '', facility_id: '', status: 'Idle'});
            onSuccess(`Equipment ${updateEquipmentId} was updated.`);
            await fetchEquipment();
        } catch {
            setError(`Could not update equipment ${updateEquipmentId}`)
        }
    }

    const handleDelete= async () => {
        try {
            await apiClient.delete(`/equipment/${deleteEquipmentId}`);

            setDeleteDialogOpen(false);
            onSuccess(`Equipment ${deleteEquipmentId} was deleted`);
            setDeleteEquipmentId('');
            await fetchEquipment();
            
        } catch {
            setError(`Could not delete equipment ${deleteEquipmentId}`)
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
                    <Button variant= "outlined" sx= {{ mb: 2}} onClick= {() => setDialogOpen(true)}>Add Equipment</Button>
                    <Button variant= "outlined" sx= {{ mb: 2}} onClick= {() => setUpdateDialogOpen(true)}>Update Equipment</Button>
                    <Button variant= "outlined" sx= {{ mb: 2}} onClick= {() => setDeleteDialogOpen(true)}>Delete Equipment</Button>
                </>
            )}
            <Box sx={{height: 400, width: '100%'}}>
                <DataGrid rows= {equipment} columns= {columns} getRowId={(row) => row.id} />
            </Box>

            <Dialog open= {dialogOpen} onClose= {() => setDialogOpen(false)}>
                <DialogTitle>Add New Equipment</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx= {{ mt: 1, minWidth: 300}}>
                        <TextField label= "Serial Number" value= {formValues.serial_number} onChange= {handleFieldChange('serial_number')} />
                        <TextField label= "Model" value= {formValues.model} onChange={handleFieldChange('model')} />
                        <TextField label= "Charge Level" type= "number" value= {formValues.charge_level} onChange={handleFieldChange('charge_level')} />
                        <TextField label= "Facility ID" type= "number" value= {formValues.facility_id} onChange={handleFieldChange('facility_id')} />
                        <TextField select label= "Status" value= {formValues.status} onChange={handleFieldChange('status')}>
                            {STATUS_OPTIONS.map((option) => (
                                <MenuItem key={option} value={option}>{option}</MenuItem>
                            ))}
                        </TextField>
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
                    <Button variant= "contained" onClick={handleCreate}>Create</Button>
                </DialogActions>
            </Dialog>

            <Dialog open= {updateDialogOpen} onClose= {() => setUpdateDialogOpen(false)}>
                <DialogTitle>Update Equipment</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx= {{ mt: 1, minWidth: 300}}>
                        <TextField label= "Equipment ID" type= "number" value= {updateEquipmentId} onChange={(event) => setUpdateEquipmentId(event.target.value)} />
                        <TextField label= "Serial Number" value= {formValues.serial_number} onChange= {handleFieldChange('serial_number')} />
                        <TextField label= "Model" value= {formValues.model} onChange={handleFieldChange('model')} />
                        <TextField label= "Charge Level" type= "number" value= {formValues.charge_level} onChange={handleFieldChange('charge_level')} />
                        <TextField label= "Facility ID" type= "number" value= {formValues.facility_id} onChange={handleFieldChange('facility_id')} />
                        <TextField select label= "Status" value= {formValues.status} onChange={handleFieldChange('status')}>
                            {STATUS_OPTIONS.map((option) => (
                                <MenuItem key={option} value={option}>{option}</MenuItem>
                            ))}
                        </TextField>
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setUpdateDialogOpen(false)}>Cancel</Button>
                    <Button variant= "contained" disabled={!updateEquipmentId} onClick={handleUpdate}>Update</Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
            >
                <DialogTitle>Delete Equipment</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Equipment ID"
                        type="number"
                        fullWidth
                        value={deleteEquipmentId}
                        onChange={(event) =>
                            setDeleteEquipmentId(event.target.value)
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
                        disabled={!deleteEquipmentId}
                        onClick={handleDelete}
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

        </Box>
    );
}

export default EquipmentDataGrid;