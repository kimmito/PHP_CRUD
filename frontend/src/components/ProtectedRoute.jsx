import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ roles, children }) {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return <div className='p-6 text-gray-600'>Загрузка...</div>;
    }

    if (!user) {
        return <Navigate to='/' replace state={{ from: location.pathname, message: 'Требуется авторизация' }} />;
    }

    if (user.status !== 'approved' || !roles.includes(user.role)) {
        return (
            <div className='max-w-3xl mx-auto bg-white border border-red-200 rounded p-6 text-red-700'>
                Недостаточно прав для доступа к данному разделу
            </div>
        );
    }

    return children;
}
