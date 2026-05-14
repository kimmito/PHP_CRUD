import { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const initialForm = {
    username: '',
    email: '',
    full_name: '',
    password: '',
};

export default function RegisterForm() {
    const { register } = useAuth();
    const [form, setForm] = useState(initialForm);
    const [errors, setErrors] = useState({});
    const [message, setMessage] = useState('');
    const [busy, setBusy] = useState(false);

    const validate = () => {
        const nextErrors = {};
        if (!/^[A-Za-z0-9_.-]{3,50}$/.test(form.username.trim())) {
            nextErrors.username = 'Логин: 3-50 латинских символов, цифр или знаков _.-';
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
            nextErrors.email = 'Введите корректный e-mail';
        }
        if (form.full_name.trim().length < 3) {
            nextErrors.full_name = 'Введите ФИО';
        }
        if (form.password.length < 8) {
            nextErrors.password = 'Минимальная длина пароля: 8 символов';
        }
        return nextErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const nextErrors = validate();
        setErrors(nextErrors);
        setMessage('');
        if (Object.keys(nextErrors).length > 0) return;

        setBusy(true);
        try {
            const res = await register({
                ...form,
                username: form.username.trim(),
                email: form.email.trim(),
                full_name: form.full_name.trim(),
            });
            setForm(initialForm);
            setMessage(res.message || 'Заявка отправлена администратору');
        } catch (error) {
            setErrors(error.response?.data?.errors || {});
            setMessage(error.response?.data?.message || 'Не удалось зарегистрироваться');
        } finally {
            setBusy(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className='bg-white border border-gray-200 rounded p-5 space-y-4'>
            <h2 className='text-xl font-semibold text-gray-900'>Регистрация</h2>
            {message && (
                <div
                    className={`rounded px-3 py-2 text-sm ${
                        Object.keys(errors).length ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
                    }`}
                >
                    {message}
                </div>
            )}
            <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Логин</label>
                <input
                    required
                    maxLength={50}
                    className='w-full border rounded p-2 focus:ring-2 focus:ring-blue-500'
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                />
                {errors.username && <p className='mt-1 text-sm text-red-600'>{errors.username}</p>}
            </div>
            <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>E-mail</label>
                <input
                    required
                    type='email'
                    maxLength={150}
                    className='w-full border rounded p-2 focus:ring-2 focus:ring-blue-500'
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
                {errors.email && <p className='mt-1 text-sm text-red-600'>{errors.email}</p>}
            </div>
            <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>ФИО</label>
                <input
                    required
                    maxLength={150}
                    className='w-full border rounded p-2 focus:ring-2 focus:ring-blue-500'
                    value={form.full_name}
                    onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                />
                {errors.full_name && <p className='mt-1 text-sm text-red-600'>{errors.full_name}</p>}
            </div>
            <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Пароль</label>
                <input
                    required
                    type='password'
                    minLength={8}
                    maxLength={72}
                    className='w-full border rounded p-2 focus:ring-2 focus:ring-blue-500'
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
                {errors.password && <p className='mt-1 text-sm text-red-600'>{errors.password}</p>}
            </div>
            <button
                type='submit'
                disabled={busy}
                className='inline-flex items-center gap-2 rounded bg-blue-700 px-4 py-2 text-white hover:bg-blue-800 disabled:opacity-60'
            >
                <UserPlus className='h-4 w-4' />
                Отправить заявку
            </button>
        </form>
    );
}
