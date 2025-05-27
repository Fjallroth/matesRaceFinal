import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Login from './pages/Login.tsx';
import Home from './components/home.tsx';
import RaceDetail from './pages/RaceDetail.tsx';
import CreateRaceForm from './components/CreateRaceForm.tsx';
import EditRacePage from './pages/EditRacePage.tsx';
import Footer from './components/Footer.tsx'; 
import AboutPage from './pages/AboutPage.tsx'; 
import { useAuth } from './AuthContext.tsx';
import { Toaster } from "@/components/ui/toaster"; 

const AppLayout: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow">
        <Outlet /> 
      </main>
      <Footer />
      <Toaster /> 
    </div>
  );
};

const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading authentication...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <AppLayout />; 
};

const PublicRoute: React.FC = () => {
  
  return <AppLayout />;
};


const App: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-background text-foreground">
        Loading Application...
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route element={<PublicRoute />}>
           <Route path="/login" element={<Login />} />
           <Route path="/about" element={<AboutPage />} />
        </Route>


        <Route element={<ProtectedRoute />}>
          <Route path="/home" element={<Home />} />
          <Route path="/my-races" element={<Home />} /> 
          <Route path="/race/:raceId" element={<RaceDetail />} />
          <Route path="/create-race" element={<CreateRaceForm />} />
          <Route path="/edit-race/:raceId" element={<EditRacePage />} />
        </Route>

        <Route
          path="/"
          element={isAuthenticated ? <Navigate to="/home" replace /> : <Navigate to="/login" replace />}
        />
        <Route path="*" element={
          <div className="flex flex-col min-h-screen">
            <main className="flex-grow container mx-auto px-4 py-8 text-center">
              <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
              <p className="text-muted-foreground mb-8">The page you're looking for doesn't exist or has been moved.</p>
              <a href={isAuthenticated ? "/home" : "/login"} className="text-primary hover:underline">
                Go to {isAuthenticated ? "Dashboard" : "Login"}
              </a>
            </main>
            <Footer />
            <Toaster />
          </div>
        } />
      </Routes>
    </Router>
  );
};

export default App;