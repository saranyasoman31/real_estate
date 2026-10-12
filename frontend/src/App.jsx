import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import CommonLayout from './components/CommonLayout';
import AppRoutes from './routes/AppRoutes';

function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <AuthProvider>
        <CommonLayout>
          <AppRoutes />
        </CommonLayout>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
