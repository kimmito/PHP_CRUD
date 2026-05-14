import { createBrowserRouter } from 'react-router-dom';
import App from './App';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/home/Home';
import Departments from './pages/departments/Departments';
import Products from './pages/products/Products';
import Sales from './pages/sales/Sales';
import Report from './pages/report/Report';
import Users from './pages/admin/Users';

const router = createBrowserRouter([
    {
        path: '/',
        element: <App />,
        children: [
            {
                index: true,
                element: <Home />,
            },
            {
                path: 'departments',
                element: (
                    <ProtectedRoute roles={['admin']}>
                        <Departments />
                    </ProtectedRoute>
                ),
            },
            {
                path: 'products',
                element: (
                    <ProtectedRoute roles={['admin']}>
                        <Products />
                    </ProtectedRoute>
                ),
            },
            {
                path: 'sales',
                element: (
                    <ProtectedRoute roles={['admin']}>
                        <Sales />
                    </ProtectedRoute>
                ),
            },
            {
                path: 'report',
                element: (
                    <ProtectedRoute roles={['admin', 'operator']}>
                        <Report />
                    </ProtectedRoute>
                ),
            },
            {
                path: 'users',
                element: (
                    <ProtectedRoute roles={['admin']}>
                        <Users />
                    </ProtectedRoute>
                ),
            },
        ],
    },
]);

export default router;
