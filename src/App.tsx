import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AuthProvider } from './context/AuthContext';
import { OllamaProvider } from './context/OllamaContext';
import { RequireAuth, RequireAdmin, RequireClient, RedirectIfAuth, NotFoundRedirect } from './components/ProtectedRoute';
import AppLayout from './components/AppLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Activity from './pages/Activity';
import Workouts from './pages/Workouts';
import Strength from './pages/Strength';
import Measurements from './pages/Measurements';
import Photos from './pages/Photos';
import Nutrition from './pages/Nutrition';
import Sleep from './pages/Sleep';
import Programs from './pages/Programs';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import ImportData from './pages/ImportData';

import './styles/globals.css';
import './styles/layout.css';

function App() {
  return (
    <AuthProvider>
      <OllamaProvider>
        <AppProvider>
        <BrowserRouter>
          <Routes>
            {/* Public – redirect to app if already logged in */}
            <Route element={<RedirectIfAuth />}>
              <Route path="/login" element={<Login />} />
            </Route>

            {/* Protected client + admin routes */}
            <Route element={<RequireAuth />}>
              <Route element={<AppLayout />}>
                {/* Client-only — admins are redirected to /admin */}
                <Route element={<RequireClient />}>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/activity" element={<Activity />} />
                  <Route path="/workouts" element={<Workouts />} />
                  <Route path="/strength" element={<Strength />} />
                  <Route path="/measurements" element={<Measurements />} />
                  <Route path="/photos" element={<Photos />} />
                  <Route path="/nutrition" element={<Nutrition />} />
                  <Route path="/sleep" element={<Sleep />} />
                  <Route path="/programs" element={<Programs />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/import" element={<ImportData />} />
                </Route>

                {/* Admin-only */}
                <Route element={<RequireAdmin />}>
                  <Route path="/admin" element={<Admin />} />
                </Route>
              </Route>
            </Route>

            {/* Fallback */}
            <Route path="*" element={<NotFoundRedirect />} />
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </OllamaProvider>
    </AuthProvider>
  );
}
export default App;


