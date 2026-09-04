import { useEffect, useState } from "react";
import {DataGrid} from '@mui/x-data-grid';
import { Alert, Box, CircularProgress, Button, TextField } from "@mui/material";
import apiClient from "../../api/client";
import { useAuth } from "../../context/AuthContext.jsx"
import { hasRole } from "../../permissions.js";

const ADMIN= "Clinical Admin"
const TECHNICIAN= "Field Technician"
const AUDITOR= "Auditor"

const reliabilityColumns= [
    {field: 'model', headerName: 'Equipment Model', width: 180},
    {field: 'complete_count', headerName: 'Completed Orders', width: 170, type: 'number'},
    {field: 'fail_count', headerName: 'Failed Orders', width: 150, type: 'number'},
    {}
];

const maintenanceColumns= [
    {field: 'hospital_id', headerName: 'Hospital ID', width: 120, type: 'number'},
    {field: 'hospital_name', headerName: 'Hospital Name', width: 200},
    {}
];

const reportingColumns= [
    {field: 'supervisor_id', headerName: 'Supervisor ID', width: 140, type: 'number'},
    {field: 'supervisor_name', headerName: 'Supervisor Name', width: 200},
    {field: 'technicians_with_active_orders', headerName: 'Technicians With Active Orders', width: 250, type: 'number'},
    {}
];

function AnalyticsDataGrid({onSuccess}){
    const { user } = useAuth();

    const [reliabilityMetrics, setReliabilityMetrics]= useState([]);
    const [maintenanceFlags, setMaintenanceFlags]= useState([]);
    const [reportingLine, setReportingLine]= useState([]);
    const [loading, setLoading]= useState(true);
    const [error, setError]= useState(null);
    const [supervisorId, setSupervisorId]= useState('');

    async function fetchAnalytics(){
        setLoading(true);
        try{
            const reliabilityResponse= await apiClient.get('/analytics/reliability_metrics');
            const maintenanceResponse= await apiClient.get('/analytics/maintenance_flags');

            setReliabilityMetrics(reliabilityResponse.data);
            setMaintenanceFlags(maintenanceResponse.data);
            setError(null);
        } catch{
            setError('Could not load analytics data');
        } finally{
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const handleReportingLine= async () => {
        try {
            const response= await apiClient.get(`/analytics/reporting_lines/${supervisorId}`);
            setReportingLine([response.data]);
            setError(null);
        } catch {
            setError(`Could not load reporting line for supervisor ${supervisorId}`);
            setReportingLine([]);
        }
    }

    if (loading) return <CircularProgress />

    return (
        <Box>
            {error && (
                <Alert serverity= "error" onClose={() => setError(null)}>{error}</Alert>
            )}

            {hasRole(user, ADMIN, AUDITOR) && (
                <>
                    <h3>Reliability Metrics</h3>
                    <Box sx={{height: 300, width: '100%', mb: 4}}>
                        <DataGrid rows= {reliabilityMetrics} columns= {reliabilityColumns} getRowId={(row, index) => `${row.model}-${index}`} />
                    </Box>

                    <h3>Maintenance Flags</h3>
                    <Box sx={{height: 300, width: '100%', mb: 4}}>
                        <DataGrid rows= {maintenanceFlags} columns= {maintenanceColumns} getRowId={(row) => row.hospital_id} />
                    </Box>

                    <h3>Reporting Lines</h3>
                    <Box sx={{ mb: 2}}>
                        <TextField
                            label= "Supervisor ID"
                            type= "number"
                            value= {supervisorId}
                            onChange={(event) => setSupervisorId(event.target.value)}
                        />
                        <Button
                            variant= "outlined"
                            sx= {{ ml: 2}}
                            disabled={!supervisorId}
                            onClick={handleReportingLine}
                        >
                            Search
                        </Button>
                    </Box>

                    <Box sx={{height: 300, width: '100%'}}>
                        <DataGrid rows= {reportingLine} columns= {reportingColumns} getRowId={(row) => row.supervisor_id} />
                    </Box>
                </>
            )}
        </Box>
    );
}

export default AnalyticsDataGrid;
