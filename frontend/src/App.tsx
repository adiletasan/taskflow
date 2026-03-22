import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { PrivateRoute } from './components/auth/PrivateRoute';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { InboxPage } from './pages/InboxPage';
import { TodayPage } from './pages/TodayPage';
import { UpcomingPage } from './pages/UpcomingPage';
import { AllTasksPage } from './pages/AllTasksPage';
import { ProjectPage } from './pages/ProjectPage';
import { SettingsPage } from './pages/SettingsPage';
import { TemplatesPage } from './pages/TemplatesPage';
import { PricingPage } from './pages/PricingPage';
import { InvitePage } from './pages/InvitePage';

function App() {
  return (
    <Routes>
      <Route path="/login"           element={<LoginPage />} />
      <Route path="/register"        element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/invite/:token"   element={<InvitePage />} />
      <Route path="/pricing"         element={<PricingPage />} />

      <Route path="/app" element={
        <PrivateRoute><AppLayout /></PrivateRoute>
      }>
        <Route index               element={<Navigate to="inbox" replace />} />
        <Route path="inbox"        element={<InboxPage />} />
        <Route path="today"        element={<TodayPage />} />
        <Route path="upcoming"     element={<UpcomingPage />} />
        <Route path="tasks"        element={<AllTasksPage />} />
        <Route path="templates"    element={<TemplatesPage />} />
        <Route path="project/:id"  element={<ProjectPage />} />
        <Route path="settings"     element={<SettingsPage />} />
      </Route>

      <Route path="/"  element={<Navigate to="/app/inbox" replace />} />
      <Route path="*"  element={<Navigate to="/app/inbox" replace />} />
    </Routes>
  );
}

export default App;