import { useEffect, useState } from "react";
import {DataGrid} from '@mui/x-data-grid';
import { Alert, Box, CircularProgress, Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField } from "@mui/material";
import apiClient from "../../api/client";
import { useAuth } from "../../context/AuthContext.jsx"
import { hasRole } from "../../permissions.js";

const ADMIN= "Clinical Admin"
const TECHNICIAN= "Field Technician"
const AUDITOR= "Auditor"

const columns= [
    {field: 'id', headerName: 'ID', width: 70},
    {field: 'work_order_id', headerName: 'Work Order ID', width: 130, type: 'number'},
    {field: 'file_url', headerName: 'File URL', width: 250},
    {field: 'notes', headerName: 'Notes', width: 250},
    {field: 'created_at', headerName: 'Created At', width: 180},
    {}
];

function ServiceReportDataGrid({onSuccess}){
    const { user } = useAuth();

    const [serviceReports, setServiceReports]= useState([]);
    const [loading, setLoading]= useState(true);
    const [error, setError]= useState(null);
    const [dialogOpen, setDialogOpen]= useState(false);
    const [formValues, setFormValues]= useState({
        work_order_id: '',
        file_url: '',
        notes: '',
        created_at: '',
    });
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleteServiceReportId, setDeleteServiceReportId] = useState('');
    const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
    const [updateServiceReportId, setUpdateServiceReportId] = useState('');

    async function fetchServiceReports(){
        setLoading(true);
        try{
            const response= await apiClient.get('/service_reports');
            setServiceReports(response.data);
            setError(null);
        } catch{
            setError('Could not load service report data');
        } finally{
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchServiceReports();
    }, []);

    const handleFieldChange= (field) => event => {
        setFormValues((prev) => ({ ...prev, [field]: event.target.value}))
    }

    const handleCreate= async () => {
        try {
            await apiClient.post('/service_reports', {
                ...formValues,
                work_order_id: Number(formValues.work_order_id),
            });

            setDialogOpen(false);
            setFormValues({
                work_order_id: '',
                file_url: '',
                notes: '',
                created_at: '',
            });

            onSuccess(`Service report for work order ${formValues.work_order_id} was created.`);
            await fetchServiceReports();
        } catch {
            setError('Could not create service report');
        }
    }

    const handleUpdate= async () => {
        try {
            await apiClient.patch(`/service_reports/${updateServiceReportId}`, {
                ...formValues,
                work_order_id: Number(formValues.work_order_id),
            });

            setUpdateDialogOpen(false);
            setUpdateServiceReportId('');
            setFormValues({
                work_order_id: '',
                file_url: '',
                notes: '',
                created_at: '',
            });

            onSuccess(`Service report ${updateServiceReportId} was updated.`);
            await fetchServiceReports();
        } catch {
            setError(`Could not update service report ${updateServiceReportId}`)
        }
    }

    const handleDelete= async () => {
        try {
            await apiClient.delete(`/service_reports/${deleteServiceReportId}`);

            setDeleteDialogOpen(false);
            onSuccess(`Service report ${deleteServiceReportId} was deleted`);
            setDeleteServiceReportId('');
            await fetchServiceReports();
            
        } catch {
            setError(`Could not delete service report ${deleteServiceReportId}`)
        }
    }

    if (loading) return <CircularProgress />

    return (
        <Box>
            {error && (
                <Alert serverity= "error" onClose={() => setError(null)}>{error}</Alert>
            )}

            {hasRole(user, ADMIN, TECHNICIAN) && (
                <>
                    <Button variant= "outlined" sx= {{ mb: 2}} onClick= {() => setDialogOpen(true)}>Add Service Report</Button>
                </>
            )}

            {hasRole(user, ADMIN) && (
                <>
                    <Button variant= "outlined" sx= {{ mb: 2}} onClick= {() => setUpdateDialogOpen(true)}>Update Service Report</Button>
                    <Button variant= "outlined" sx= {{ mb: 2}} onClick= {() => setDeleteDialogOpen(true)}>Delete Service Report</Button>
                </>
            )}

            <Box sx={{height: 400, width: '100%'}}>
                <DataGrid rows= {serviceReports} columns= {columns} getRowId={(row) => row.id} />
            </Box>

            <Dialog open= {dialogOpen} onClose= {() => setDialogOpen(false)}>
                <DialogTitle>Add New Service Report</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx= {{ mt: 1, minWidth: 300}}>
                        <TextField label= "Work Order ID" type= "number" value= {formValues.work_order_id} onChange= {handleFieldChange('work_order_id')} />
                        <TextField label= "File URL" value= {formValues.file_url} onChange= {handleFieldChange('file_url')} />
                        <TextField label= "Notes" multiline rows={3} value= {formValues.notes} onChange= {handleFieldChange('notes')} />
                        <TextField label= "Created At" type= "datetime-local" value= {formValues.created_at} onChange= {handleFieldChange('created_at')} InputLabelProps={{ shrink: true }} />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
                    <Button variant= "contained" onClick={handleCreate}>Create</Button>
                </DialogActions>
            </Dialog>

            <Dialog open= {updateDialogOpen} onClose= {() => setUpdateDialogOpen(false)}>
                <DialogTitle>Update Service Report</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx= {{ mt: 1, minWidth: 300}}>
                        <TextField label= "Service Report ID" type= "number" value= {updateServiceReportId} onChange={(event) => setUpdateServiceReportId(event.target.value)} />
                        <TextField label= "Work Order ID" type= "number" value= {formValues.work_order_id} onChange= {handleFieldChange('work_order_id')} />
                        <TextField label= "File URL" value= {formValues.file_url} onChange= {handleFieldChange('file_url')} />
                        <TextField label= "Notes" multiline rows={3} value= {formValues.notes} onChange= {handleFieldChange('notes')} />
                        <TextField label= "Created At" type= "datetime-local" value= {formValues.created_at} onChange= {handleFieldChange('created_at')} InputLabelProps={{ shrink: true }} />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setUpdateDialogOpen(false)}>Cancel</Button>
                    <Button variant= "contained" disabled={!updateServiceReportId} onClick={handleUpdate}>Update</Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
            >
                <DialogTitle>Delete Service Report</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Service Report ID"
                        type="number"
                        fullWidth
                        value={deleteServiceReportId}
                        onChange={(event) =>
                            setDeleteServiceReportId(event.target.value)
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
                        disabled={!deleteServiceReportId}
                        onClick={handleDelete}
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

        </Box>
    );
}

export default ServiceReportDataGrid;