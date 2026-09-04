import { Container, Typography, Box, Snackbar, Alert } from '@mui/material'
import { useState } from 'react'
import AppHeader from './components/layout/AppHeader.jsx'
import { ThemeProvider } from '@mui/material/styles'
import theme from './theme.js'

import { AuthProvider, useAuth } from './context/AuthContext.jsx'
import { hasRole } from "./permissions.js";

import LoginForm from './components/auth/LoginForm.jsx'
import EquipmentDataGrid from './components/equipment/EquipmentDataGrid.jsx'
import DiscrepancyDataGrid from './components/work_orders/DiscrepancyDataGrid.jsx'
import WorkOrderDataGrid from './components/work_orders/WorkOrderDataGrid.jsx'
import HospitalDataGrid from './components/hospitals/HospitalDataGrid.jsx'
import ServiceReportDataGrid from './components/service_reports/ServiceReportDataGrid.jsx'
import UserDataGrid from './components/users/UserDataGrid.jsx'
import AnalyticsDataGrid from './components/analytics/AnalyticsDataGrid.jsx';


function Dashboard(){
  const {user, logout} = useAuth()
  const [notification, setNotification]= useState(null)
  const ADMIN= "Clinical Admin"
  const TECHNICIAN= "Field Technician"
  const AUDITOR= "Auditor"

  return (
    <>
      <AppHeader username= {user?.sub} role= {user?.role} onLogout= {logout} />

      <Container maxWidth= "lg" sx={{ mt:4}}>

        <Typography variant= "h5" component="h2" gutterBottom>
          Command Center Overview
        </Typography>

        <Typography variant= "h5" component="h5" gutterBottom>
          Equipment
        </Typography>

        <Box sx={{ mb: 4}}>
          <EquipmentDataGrid onSuccess={setNotification} />
        </Box>

        {hasRole(user, ADMIN, AUDITOR) && (
          <>
            <Typography variant= "h5" component="h5" gutterBottom>
              Co-Location Discrepancies
            </Typography>

            <Box sx={{ mb: 4}}>
              <DiscrepancyDataGrid/>
            </Box>
          </>
        )}

        {hasRole(user, ADMIN, AUDITOR) && (
          <>
            <Typography variant= "h5" component="h5" gutterBottom>
              Analytics
            </Typography>

            <Box sx={{ mb: 4}}>
              <AnalyticsDataGrid />
            </Box>
          </>
        )}

        {hasRole(user, ADMIN, AUDITOR) && (
          <>
            <Typography variant= "h5" component="h5" gutterBottom>
              Hospitals
            </Typography>

            <Box sx={{ mb: 4}}>
              <HospitalDataGrid onSuccess={setNotification}/>
            </Box>
          </>
        )}

        {hasRole(user, ADMIN, TECHNICIAN, AUDITOR) && (
          <>
            <Typography variant= "h5" component="h5" gutterBottom>
              Work Orders
            </Typography>

            <Box sx={{ mb: 4}}>
              <WorkOrderDataGrid onSuccess={setNotification}/>
            </Box>
          </>
        )}

        {hasRole(user, ADMIN, TECHNICIAN, AUDITOR) && (
          <>
            <Typography variant= "h5" component="h5" gutterBottom>
              Service Reports
            </Typography>

            <Box sx={{ mb: 4}}>
              <ServiceReportDataGrid onSuccess={setNotification}/>
            </Box>
          </>
        )}

        {hasRole(user, ADMIN, AUDITOR) && (
          <>
            <Typography variant= "h5" component="h5" gutterBottom>
              Users
            </Typography>

            <Box sx={{ mb: 4}}>
              <UserDataGrid onSuccess={setNotification}/>
            </Box>
          </>
        )}

      </Container>

      <Snackbar
        open= {Boolean(notification)}
        autoHideDuration={4000}
        onClose= {() => setNotification(null)}>
          <Alert severity="success" onClose={() => setNotification(null)}>
            {notification}
          </Alert>
      </Snackbar>
    </>
  )
}

function AppContent(){
  const {isAuthenticated} = useAuth();
  return isAuthenticated ? <Dashboard /> : <LoginForm />;
}


function App() {
  return(
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App