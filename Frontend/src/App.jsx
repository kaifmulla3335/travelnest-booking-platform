import { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import useSiteStore from './store/siteStore';
import axiosInstance from './api/axios';
import ErrorBoundary from './components/common/ErrorBoundary';

const App = () => {
  const setSiteSettings = useSiteStore(s => s.setSiteSettings);

  // Fetch site settings once on app load — used by Navbar/Footer for branding
  useEffect(() => {
    axiosInstance.get('/settings/public')
      .then(res => setSiteSettings(res.data))
      .catch(() => {}); // Silently fail — defaults will be used
  }, [setSiteSettings]);

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </ErrorBoundary>
  );
};

export default App;