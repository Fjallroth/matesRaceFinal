import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Login from './pages/Login.tsx';
import Home from './components/home.tsx'; 
import RaceDetail from './pages/RaceDetail.tsx';
import CreateRaceForm from './components/CreateRaceForm.tsx';
import EditRacePage from './pages/EditRacePage.tsx'; 
import { useAuth } from './AuthContext.tsx';

const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading authentication...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />; 
};

const App: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        Loading Application...
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<ProtectedRoute />}> 
          <Route path="/home" element={<Home />} />
          <Route path="/race/:raceId" element={<RaceDetail />} />
          <Route path="/create-race" element={<CreateRaceForm />} />
          <Route path="/edit-race/:raceId" element={<EditRacePage />} />
        </Route>

        <Route
          path="/"
          element={isAuthenticated ? <Navigate to="/home" replace /> : <Navigate to="/login" replace />}
        />
        <Route path="*" element={<Navigate to={isAuthenticated ? "/home" : "/login"} replace />} />
      </Routes>
    </Router>
  );
};

export default App;