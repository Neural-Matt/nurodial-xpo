import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { RoleProvider } from './context/RoleContext';
import { MainLayout } from './layouts/MainLayout';
import { buildRoutes } from './config/routesConfig';

export function App() {
  return (
    <RoleProvider>
      <Router>
        <MainLayout>
          <Routes>
            {buildRoutes()}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </MainLayout>
      </Router>
    </RoleProvider>
  );
}

export default App;
