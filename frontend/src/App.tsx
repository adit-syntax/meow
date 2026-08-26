/**
 * frontend/src/App.tsx
 * SkyGuard AI — Root Application Component.
 * Composes the React Router provider with all top-level context providers:
 * SystemConfigurationProvider, SelectedEventProvider, and ToastProvider.
 */

import { RouterProvider } from 'react-router-dom';
import { router } from './app/routes';
import { ThemeProvider } from './context/ThemeContext';
import { SystemConfigurationProvider } from './context/SystemConfigurationContext';
import { SelectedEventProvider } from './context/SelectedEventContext';
import { ToastProvider } from './context/ToastContext';
import { MistyProvider } from './context/MistyContext';

export default function App() {
  return (
    <ThemeProvider>
      <SystemConfigurationProvider>
        <SelectedEventProvider>
          <ToastProvider>
            <MistyProvider>
              <RouterProvider router={router} />
            </MistyProvider>
          </ToastProvider>
        </SelectedEventProvider>
      </SystemConfigurationProvider>
    </ThemeProvider>
  );
}
