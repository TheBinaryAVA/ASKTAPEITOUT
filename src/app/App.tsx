import { RouterProvider } from 'react-router';
import { router } from './routes';
import ErrorAnalyzer from './pages/ErrorAnalyzer';

export default function App() {
  return <RouterProvider router={router} />;
}
