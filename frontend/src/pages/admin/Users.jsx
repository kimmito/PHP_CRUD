import { useEffect, useState } from 'react';
import { Check, Save, X } from 'lucide-react';
import { approveUser, getUsers, rejectUser, updateUser } from '../../api/auth';

export default function Users() {
    const [users, setUsers] = useState([]);
    const [message, setMessage] = useState('');

    const loadUsers = async () => {
        const res = await getUsers();
        setUsers(res.users || []);
    };

    useEffect(() => {
        let active = true;

        getUsers()
            .then((res) => {
                if (active) {
                    setUsers(res.users || []);
                }
            })
            .catch(() => {
                if (active) {
                    setMessage('Не удалось загрузить пользователей');
                }
            });

        return () => {
            active = false;
        };
    }, []);

    const updateLocal = (id, patch) => {
        setUsers((items) => items.map((item) => (item.id === id ? { ...item, ...patch } : item)));
    };

    const handleApprove = async (id) => {
        await approveUser(id, 'operator');
        setMessage('Пользователь одобрен как оператор');
        await loadUsers();
    };

    const handleReject = async (id) => {
        await rejectUser(id);
        setMessage('Заявка отклонена');
        await loadUsers();
    };

    const handleSave = async (user) => {
        await updateUser(user.id, {
            username: user.username,
            email: user.email,
            full_name: user.full_name,
            role: user.role,
            status: user.status,
        });
        setMessage('Данные пользователя сохранены');
        await loadUsers();
    };

    return (
        <div className='bg-white rounded p-6 max-w-6xl mx-auto'>
            <h2 className='text-2xl font-bold mb-4'>Модерация заявок и права пользователей</h2>
            {message && <div className='mb-4 rounded bg-blue-50 px-4 py-3 text-blue-800'>{message}</div>}

            <div className='overflow-x-auto rounded border border-gray-200'>
                <table className='min-w-full divide-y divide-gray-200'>
                    <thead className='bg-gray-50'>
                        <tr>
                            <th className='px-4 py-3 text-left text-xs font-semibold uppercase text-gray-600'>Логин</th>
                            <th className='px-4 py-3 text-left text-xs font-semibold uppercase text-gray-600'>E-mail</th>
                            <th className='px-4 py-3 text-left text-xs font-semibold uppercase text-gray-600'>ФИО</th>
                            <th className='px-4 py-3 text-left text-xs font-semibold uppercase text-gray-600'>Роль</th>
                            <th className='px-4 py-3 text-left text-xs font-semibold uppercase text-gray-600'>Статус</th>
                            <th className='px-4 py-3 text-left text-xs font-semibold uppercase text-gray-600'>Входы</th>
                            <th className='px-4 py-3 text-right text-xs font-semibold uppercase text-gray-600'>Действия</th>
                        </tr>
                    </thead>
                    <tbody className='divide-y divide-gray-200 bg-white'>
                        {users.map((user) => (
                            <tr key={user.id} className='align-top'>
                                <td className='px-4 py-3'>
                                    <input
                                        className='w-32 rounded border p-2'
                                        value={user.username}
                                        onChange={(e) => updateLocal(user.id, { username: e.target.value })}
                                    />
                                </td>
                                <td className='px-4 py-3'>
                                    <input
                                        className='w-48 rounded border p-2'
                                        type='email'
                                        value={user.email}
                                        onChange={(e) => updateLocal(user.id, { email: e.target.value })}
                                    />
                                </td>
                                <td className='px-4 py-3'>
                                    <input
                                        className='w-48 rounded border p-2'
                                        value={user.full_name}
                                        onChange={(e) => updateLocal(user.id, { full_name: e.target.value })}
                                    />
                                </td>
                                <td className='px-4 py-3'>
                                    <select
                                        className='rounded border p-2'
                                        value={user.role}
                                        onChange={(e) => updateLocal(user.id, { role: e.target.value })}
                                    >
                                        <option value='guest'>guest</option>
                                        <option value='operator'>operator</option>
                                        <option value='admin'>admin</option>
                                    </select>
                                </td>
                                <td className='px-4 py-3'>
                                    <select
                                        className='rounded border p-2'
                                        value={user.status}
                                        onChange={(e) => updateLocal(user.id, { status: e.target.value })}
                                    >
                                        <option value='pending'>pending</option>
                                        <option value='approved'>approved</option>
                                        <option value='rejected'>rejected</option>
                                    </select>
                                </td>
                                <td className='px-4 py-3 text-sm text-gray-700'>
                                    <div>{user.login_count}</div>
                                    <div>{user.last_login_at || '-'}</div>
                                </td>
                                <td className='px-4 py-3'>
                                    <div className='flex justify-end gap-2'>
                                        {user.status === 'pending' && (
                                            <>
                                                <button
                                                    className='rounded bg-green-600 p-2 text-white hover:bg-green-700'
                                                    title='Одобрить оператором'
                                                    onClick={() => handleApprove(user.id)}
                                                >
                                                    <Check className='h-4 w-4' />
                                                </button>
                                                <button
                                                    className='rounded bg-red-600 p-2 text-white hover:bg-red-700'
                                                    title='Отклонить'
                                                    onClick={() => handleReject(user.id)}
                                                >
                                                    <X className='h-4 w-4' />
                                                </button>
                                            </>
                                        )}
                                        <button
                                            className='rounded bg-blue-700 p-2 text-white hover:bg-blue-800'
                                            title='Сохранить'
                                            onClick={() => handleSave(user)}
                                        >
                                            <Save className='h-4 w-4' />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {users.length === 0 && (
                            <tr>
                                <td colSpan='7' className='px-6 py-10 text-center text-gray-500'>
                                    Пользователи не найдены
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
