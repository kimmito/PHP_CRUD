import { createBrowserRouter } from 'react-router-dom';
import App from './App';
import Departments from './pages/departments/Departments';
import Products from './pages/products/Products';
import Sales from './pages/sales/Sales';
import Report from './pages/report/Report';

const router = createBrowserRouter([
    {
        path: '/',
        element: <App />,
        children: [
            {
                index: true,
                element: <Departments />,
            },
            {
                path: 'products',
                element: <Products />,
            },
            {
                path: 'sales',
                element: <Sales />,
            },
            {
                path: 'report',
                element: <Report />,
            },
        ],
    },
]);

export default router;
