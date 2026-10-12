import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import CommonLayout from './components/CommonLayout';
import AppRoutes from './routes/AppRoutes';

const getBasename = () => {
  const pathname = window.location.pathname;
  if (/^\/darv(\/|$)/i.test(pathname)) {
    const match = pathname.match(/^\/([^/]+)/);
    return `/${match[1]}`;
  }
  return '/';
};

function App() {
  const basename = getBasename();

  return (
    <BrowserRouter basename={basename === '/' ? undefined : basename}>
      <AuthProvider>
        <CommonLayout>
          <AppRoutes />
        </CommonLayout>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
