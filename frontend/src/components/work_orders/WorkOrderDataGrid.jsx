import { useEffect, useState } from "react";
import {DataGrid} from '@mui/x-data-grid';
import { Alert, Box, CircularProgress, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Stack, TextField } from "@mui/material";
import apiClient from "../../api/client";
import { useAuth } from "../../context/AuthContext.jsx"
import { hasRole } from "../../permissions.js";

const ADMIN= "Clinical Admin"
const TECHNICIAN= "Field Technician"
const AUDITOR= "Auditor"

const PRIORITY_OPTIONS= ['Low', 'Medium', 'Critical'];
const STATUS_OPTIONS= ['Pending', 'In-Progress', 'Completed', 'Failed'];

const columns= [
    {field: 'id', headerName: 'ID', width: 70},
    {field: 'title', headerName: 'Title', width: 220},
    {field: 'priority', headerName: 'Priority', width: 130},
    {field: 'status', headerName: 'Status', width: 140},
    {field: 'equipment_id', headerName: 'Equipment ID', width: 130, type: 'number'},
    {field: 'technician_id', headerName: 'Technician ID', width: 130, type: 'number'},
    {}
];

function WorkOrderDataGrid({onSuccess}){
    const { user } = useAuth();

    const [workOrders, setWorkOrders]= useState([]);
    const [loading, setLoading]= useState(true);
    const [error, setError]= useState(null);
    const [dialogOpen, setDialogOpen]= useState(false);
    const [formValues, setFormValues]= useState({
        title: '',
        priority: 'Low',
        status: 'Pending',
        equipment_id: '',
        technician_id: '',
    });
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleteWorkOrderId, setDeleteWorkOrderId] = useState('');
    const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
    const [updateWorkOrderId, setUpdateWorkOrderId] = useState('');
    const [updateStatus, setUpdateStatus] = useState('Pending');

    async function fetchWorkOrders(){
        setLoading(true);
        try{
            const response= await apiClient.get('/work_orders');
            setWorkOrders(response.data);
            setError(null);
        } catch{
            setError('Could not load work order data');
        } finally{
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchWorkOrders();
    }, []);

    const handleFieldChange= (field) => event => {
        setFormValues((prev) => ({ ...prev, [field]: event.target.value}))
    }

    const handleCreate= async () => {
        try {
            await apiClient.post('/work_orders', {
                ...formValues,
                equipment_id: Number(formValues.equipment_id),
                technician_id: Number(formValues.technician_id),
            });

            setDialogOpen(false);
            setFormValues({
                title: '',
                priority: 'Low',
                status: 'Pending',
                equipment_id: '',
                technician_id: '',
            });

            onSuccess(`Work order ${formValues.title} was created.`);
            await fetchWorkOrders();
        } catch {
            setError('Could not create work order');
        }
    }

    const handleUpdate= async () => {
        try {
            await apiClient.patch(`/work_orders/${updateWorkOrderId}/status`, {
                status: updateStatus,
            });

            setUpdateDialogOpen(false);
            setUpdateWorkOrderId('');
            setUpdateStatus('Pending');

            onSuccess(`Work order ${updateWorkOrderId} was updated.`);
            await fetchWorkOrders();
        } catch {
            setError(`Could not update work order ${updateWorkOrderId}`)
        }
    }

    const handleDelete= async () => {
        try {
            await apiClient.delete(`/work_orders/${deleteWorkOrderId}`);

            setDeleteDialogOpen(false);
            onSuccess(`Work order ${deleteWorkOrderId} was deleted`);
            setDeleteWorkOrderId('');
            await fetchWorkOrders();
            
        } catch {
            setError(`Could not delete work order ${deleteWorkOrderId}`)
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
                    <Button variant= "outlined" sx= {{ mb: 2}} onClick= {() => setDialogOpen(true)}>Add Work Order</Button>
                    <Button variant= "outlined" sx= {{ mb: 2}} onClick= {() => setUpdateDialogOpen(true)}>Update Status</Button>
                    <Button variant= "outlined" sx= {{ mb: 2}} onClick= {() => setDeleteDialogOpen(true)}>Delete Work Order</Button>
                </>
            )}

            {hasRole(user, TECHNICIAN) && (
                <Button variant= "outlined" sx= {{ mb: 2}} onClick= {() => setUpdateDialogOpen(true)}>Update Status</Button>
            )}

            <Box sx={{height: 400, width: '100%'}}>
                <DataGrid rows= {workOrders} columns= {columns} getRowId={(row) => row.id} />
            </Box>

            <Dialog open= {dialogOpen} onClose= {() => setDialogOpen(false)}>
                <DialogTitle>Add New Work Order</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx= {{ mt: 1, minWidth: 300}}>
                        <TextField label= "Title" value= {formValues.title} onChange= {handleFieldChange('title')} />
                        <TextField select label= "Priority" value= {formValues.priority} onChange= {handleFieldChange('priority')}>
                            {PRIORITY_OPTIONS.map((option) => (
                                <MenuItem key={option} value={option}>{option}</MenuItem>
                            ))}
                        </TextField>
                        <TextField select label= "Status" value= {formValues.status} onChange= {handleFieldChange('status')}>
                            {STATUS_OPTIONS.map((option) => (
                                <MenuItem key={option} value={option}>{option}</MenuItem>
                            ))}
                        </TextField>
                        <TextField label= "Equipment ID" type= "number" value= {formValues.equipment_id} onChange= {handleFieldChange('equipment_id')} />
                        <TextField label= "Technician ID" type= "number" value= {formValues.technician_id} onChange= {handleFieldChange('technician_id')} />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
                    <Button variant= "contained" onClick={handleCreate}>Create</Button>
                </DialogActions>
            </Dialog>

            <Dialog open= {updateDialogOpen} onClose= {() => setUpdateDialogOpen(false)}>
                <DialogTitle>Update Work Order Status</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx= {{ mt: 1, minWidth: 300}}>
                        <TextField label= "Work Order ID" type= "number" value= {updateWorkOrderId} onChange={(event) => setUpdateWorkOrderId(event.target.value)} />
                        <TextField select label= "Status" value= {updateStatus} onChange={(event) => setUpdateStatus(event.target.value)}>
                            {STATUS_OPTIONS.map((option) => (
                                <MenuItem key={option} value={option}>{option}</MenuItem>
                            ))}
                        </TextField>
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setUpdateDialogOpen(false)}>Cancel</Button>
                    <Button variant= "contained" disabled={!updateWorkOrderId} onClick={handleUpdate}>Update</Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
            >
                <DialogTitle>Delete Work Order</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Work Order ID"
                        type="number"
                        fullWidth
                        value={deleteWorkOrderId}
                        onChange={(event) =>
                            setDeleteWorkOrderId(event.target.value)
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
                        disabled={!deleteWorkOrderId}
                        onClick={handleDelete}
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

        </Box>
    );
}

export default WorkOrderDataGrid;