import LoginForm from '../auth/LoginForm';
import RegisterForm from '../auth/RegisterForm';
import { useAuth } from '../../context/AuthContext';

export default function Home() {
    const { user, loading } = useAuth();

    if (loading) {
        return <div className='p-6 text-gray-600'>Загрузка...</div>;
    }

    return (
        <div className='max-w-6xl mx-auto space-y-6'>
            <section className='bg-white border border-gray-200 rounded p-6'>
                <h1 className='text-3xl font-bold text-gray-900 mb-3'>Торгово-учетная база</h1>
                <p className='text-gray-700 leading-relaxed'>
                    Учебное веб-приложение для учета отделов, товаров, продаж и формирования ведомости выручки.
                </p>
                <div className='mt-4 grid gap-3 text-sm text-gray-700 md:grid-cols-3'>
                    <div>Проект: PHP CRUD</div>
                    <div>Backend: PHP + MySQLi</div>
                    <div>Frontend: React + Tailwind CSS</div>
                </div>
            </section>

            {!user && (
                <div className='grid gap-6 lg:grid-cols-2'>
                    <RegisterForm />
                    <LoginForm />
                </div>
            )}

            {user && (
                <section className='bg-white border border-gray-200 rounded p-6 space-y-3'>
                    <h2 className='text-xl font-semibold text-gray-900'>Текущий пользователь</h2>
                    <p className='text-gray-700'>
                        {user.full_name} ({user.username}), роль: {user.role}, статус: {user.status}
                    </p>
                    {user.role === 'operator' && user.status === 'approved' && (
                        <div className='rounded bg-blue-50 px-4 py-3 text-blue-800'>Режим оператора активен</div>
                    )}
                    {user.role === 'operator' && user.status === 'approved' && user.login_count <= 1 && (
                        <div className='rounded bg-green-50 px-4 py-3 text-green-800'>Добро пожаловать!</div>
                    )}
                    {user.role === 'operator' && user.status === 'approved' && user.login_count > 1 && (
                        <div className='rounded bg-green-50 px-4 py-3 text-green-800'>
                            Вы зашли в {user.login_count} раз. Последнее посещение: {user.previous_login_at || 'нет данных'}
                        </div>
                    )}
                </section>
            )}
        </div>
    );
}
