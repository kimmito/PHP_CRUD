import { useState } from 'react';
import { LogIn } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function LoginForm() {
    const { login } = useAuth();
    const [form, setForm] = useState({ login: '', password: '', remember: false });
    const [message, setMessage] = useState('');
    const [busy, setBusy] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setBusy(true);
        try {
            await login(form);
        } catch (error) {
            setMessage(error.response?.data?.message || 'Не удалось выполнить вход');
        } finally {
            setBusy(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className='bg-white border border-gray-200 rounded p-5 space-y-4'>
            <h2 className='text-xl font-semibold text-gray-900'>Авторизация</h2>
            {message && <div className='rounded bg-red-50 px-3 py-2 text-sm text-red-700'>{message}</div>}
            <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Логин или e-mail</label>
                <input
                    required
                    className='w-full border rounded p-2 focus:ring-2 focus:ring-blue-500'
                    value={form.login}
                    onChange={(e) => setForm({ ...form, login: e.target.value })}
                />
            </div>
            <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Пароль</label>
                <input
                    required
                    type='password'
                    className='w-full border rounded p-2 focus:ring-2 focus:ring-blue-500'
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
            </div>
            <label className='flex items-center gap-2 text-sm text-gray-700'>
                <input
                    type='checkbox'
                    checked={form.remember}
                    onChange={(e) => setForm({ ...form, remember: e.target.checked })}
                />
                Запомнить меня
            </label>
            <button
                type='submit'
                disabled={busy}
                className='inline-flex items-center gap-2 rounded bg-blue-700 px-4 py-2 text-white hover:bg-blue-800 disabled:opacity-60'
            >
                <LogIn className='h-4 w-4' />
                Войти
            </button>
        </form>
    );
}
