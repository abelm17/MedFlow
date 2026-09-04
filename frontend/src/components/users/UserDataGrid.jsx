import { useEffect, useState } from "react";
import {DataGrid} from '@mui/x-data-grid';
import { Alert, Box, CircularProgress, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Stack, TextField } from "@mui/material";
import apiClient from "../../api/client";
import { useAuth } from "../../context/AuthContext.jsx"
import { hasRole } from "../../permissions.js";

const ADMIN= "Clinical Admin"
const TECHNICIAN= "Field Technician"
const AUDITOR= "Auditor"

const ROLE_OPTIONS= [ADMIN, TECHNICIAN, AUDITOR];

const columns= [
    {field: 'id', headerName: 'ID', width: 70},
    {field: 'username', headerName: 'Username', width: 180},
    {field: 'role', headerName: 'Role', width: 180},
    {}
];

function UserDataGrid({onSuccess}){
    const { user } = useAuth();

    const [users, setUsers]= useState([]);
    const [loading, setLoading]= useState(true);
    const [error, setError]= useState(null);
    const [dialogOpen, setDialogOpen]= useState(false);
    const [formValues, setFormValues]= useState({
        username: '',
        hashed_password: '',
        role: ADMIN,
        technician_id: '',
    });
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleteUserId, setDeleteUserId] = useState('');
    const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
    const [updateUserId, setUpdateUserId] = useState('');

    async function fetchUsers(){
        setLoading(true);
        try{
            const response= await apiClient.get('/users');
            setUsers(response.data);
            setError(null);
        } catch{
            setError('Could not load user data');
        } finally{
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleFieldChange= (field) => event => {
        setFormValues((prev) => ({ ...prev, [field]: event.target.value}))
    }

    const handleCreate= async () => {
        try {
            await apiClient.post('/users', {
                ...formValues,
                technician_id: formValues.technician_id
                    ? Number(formValues.technician_id)
                    : null,
            });

            setDialogOpen(false);
            setFormValues({
                username: '',
                hashed_password: '',
                role: ADMIN,
                technician_id: '',
            });

            onSuccess(`User ${formValues.username} was created.`);
            await fetchUsers();
        } catch {
            setError('Could not create user');
        }
    }

    const handleUpdate= async () => {
        try {
            await apiClient.patch(`/users/${updateUserId}`, {
                username: formValues.username,
                role: formValues.role,
            });

            setUpdateDialogOpen(false);
            setUpdateUserId('');
            setFormValues({
                username: '',
                hashed_password: '',
                role: ADMIN,
                technician_id: '',
            });

            onSuccess(`User ${updateUserId} was updated.`);
            await fetchUsers();
        } catch {
            setError(`Could not update user ${updateUserId}`)
        }
    }

    const handleDelete= async () => {
        try {
            await apiClient.delete(`/users/${deleteUserId}`);

            setDeleteDialogOpen(false);
            onSuccess(`User ${deleteUserId} was deleted`);
            setDeleteUserId('');
            await fetchUsers();
            
        } catch {
            setError(`Could not delete user ${deleteUserId}`)
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
                    <Button variant= "outlined" sx= {{ mb: 2}} onClick= {() => setDialogOpen(true)}>Add User</Button>
                    <Button variant= "outlined" sx= {{ mb: 2}} onClick= {() => setUpdateDialogOpen(true)}>Update User</Button>
                    <Button variant= "outlined" sx= {{ mb: 2}} onClick= {() => setDeleteDialogOpen(true)}>Delete User</Button>
                </>
            )}

            <Box sx={{height: 400, width: '100%'}}>
                <DataGrid rows= {users} columns= {columns} getRowId={(row) => row.id} />
            </Box>

            <Dialog open= {dialogOpen} onClose= {() => setDialogOpen(false)}>
                <DialogTitle>Add New User</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx= {{ mt: 1, minWidth: 300}}>
                        <TextField label= "Username" value= {formValues.username} onChange= {handleFieldChange('username')} />
                        <TextField label= "Password" type= "password" value= {formValues.hashed_password} onChange= {handleFieldChange('hashed_password')} />
                        <TextField select label= "Role" value= {formValues.role} onChange= {handleFieldChange('role')}>
                            {ROLE_OPTIONS.map((option) => (
                                <MenuItem key={option} value={option}>{option}</MenuItem>
                            ))}
                        </TextField>
                        <TextField label= "Technician ID" type= "number" value= {formValues.technician_id} onChange= {handleFieldChange('technician_id')} />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
                    <Button variant= "contained" onClick={handleCreate}>Create</Button>
                </DialogActions>
            </Dialog>

            <Dialog open= {updateDialogOpen} onClose= {() => setUpdateDialogOpen(false)}>
                <DialogTitle>Update User</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx= {{ mt: 1, minWidth: 300}}>
                        <TextField label= "User ID" type= "number" value= {updateUserId} onChange={(event) => setUpdateUserId(event.target.value)} />
                        <TextField label= "Username" value= {formValues.username} onChange= {handleFieldChange('username')} />
                        <TextField select label= "Role" value= {formValues.role} onChange= {handleFieldChange('role')}>
                            {ROLE_OPTIONS.map((option) => (
                                <MenuItem key={option} value={option}>{option}</MenuItem>
                            ))}
                        </TextField>
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setUpdateDialogOpen(false)}>Cancel</Button>
                    <Button variant= "contained" disabled={!updateUserId} onClick={handleUpdate}>Update</Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
            >
                <DialogTitle>Delete User</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="User ID"
                        type="number"
                        fullWidth
                        value={deleteUserId}
                        onChange={(event) =>
                            setDeleteUserId(event.target.value)
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
                        disabled={!deleteUserId}
                        onClick={handleDelete}
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

        </Box>
    );
}

export default UserDataGrid;