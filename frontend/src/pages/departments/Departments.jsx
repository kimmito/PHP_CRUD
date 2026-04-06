import { useState, useEffect } from 'react';
import { Edit2, Trash2, PlusCircle } from 'lucide-react';
import { getDepartments, createDepartment, updateDepartment, removeDepartment } from '../../api/departments';

export default function Departments() {
    const [items, setItems] = useState([]);
    const [formData, setFormData] = useState({ name: '', boss_name: '', phone: '', floor: '' });
    const [errors, setErrors] = useState({});
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);

    const validateFormData = (data) => {
        const fieldErrors = {};
        const name = data.name.trim();
        const bossName = data.boss_name.trim();
        const phone = data.phone.trim();
        const floor = Number(data.floor);
        const digitsOnly = phone.replace(/\D/g, '');

        if (!name) {
            fieldErrors.name = 'Введите название отдела';
        }

        if (!bossName) {
            fieldErrors.boss_name = 'Введите ФИО начальника';
        } else if (bossName.length < 3) {
            fieldErrors.boss_name = 'ФИО начальника должно быть не короче 3 символов';
        }

        if (!phone) {
            fieldErrors.phone = 'Введите телефон';
        } else if (!/^\+?[\d\s()-]{10,20}$/.test(phone) || digitsOnly.length < 10 || digitsOnly.length > 15) {
            fieldErrors.phone = 'Введите корректный телефон (10-15 цифр)';
        }

        if (!Number.isInteger(floor) || floor < 1 || floor > 200) {
            fieldErrors.floor = 'Этаж должен быть целым числом от 1 до 200';
        }

        return fieldErrors;
    };

    async function loadItems() {
        try {
            const res = await getDepartments();
            setItems(Array.isArray(res) ? res : []);
        } catch (e) {
            console.error(e);
        }
    }

    useEffect(() => {
        (async () => {
            await loadItems();
        })();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const validationErrors = validateFormData(formData);
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setErrors({});

        const payload = {
            name: formData.name.trim(),
            boss_name: formData.boss_name.trim(),
            phone: formData.phone.trim(),
            floor: Number(formData.floor),
        };

        try {
            if (isEditing) {
                await updateDepartment(editId, payload);
            } else {
                await createDepartment(payload);
            }
            setFormData({ name: '', boss_name: '', phone: '', floor: '' });
            setIsEditing(false);
            setEditId(null);
            loadItems();
        } catch {
            alert('Ошибка при сохранении');
        }
    };

    const handleEdit = (item) => {
        setFormData(item);
        setErrors({});
        setIsEditing(true);
        setEditId(item.id);
    };

    const handleDelete = async (id) => {
        if (!confirm('Удалить этот отдел?')) return;
        try {
            const res = await removeDepartment(id);
            if (res && res.status === 'error') {
                alert(res.message);
            } else {
                loadItems();
            }
        } catch {
            alert('Ошибка удаления');
        }
    };

    return (
        <div className='bg-white rounded p-6 max-w-5xl mx-auto'>
            <h2 className='text-2xl font-bold mb-6'>Управление Отделами</h2>

            <form onSubmit={handleSubmit} className='mb-8 bg-gray-50 p-6 rounded border grid grid-cols-2 gap-4'>
                <div>
                    <label className='block text-sm font-medium mb-1 text-gray-700'>Название отдела</label>
                    <input
                        required
                        type='text'
                        maxLength={100}
                        className={`w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 ${errors.name ? 'border-red-500' : ''}`}
                        value={formData.name}
                        onChange={(e) => {
                            setFormData({ ...formData, name: e.target.value });
                            if (errors.name) {
                                setErrors({ ...errors, name: '' });
                            }
                        }}
                    />
                    {errors.name && <p className='mt-1 text-sm text-red-600'>{errors.name}</p>}
                </div>
                <div>
                    <label className='block text-sm font-medium mb-1 text-gray-700'>ФИО Начальника</label>
                    <input
                        required
                        type='text'
                        maxLength={120}
                        className={`w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 ${errors.boss_name ? 'border-red-500' : ''}`}
                        value={formData.boss_name}
                        onChange={(e) => {
                            setFormData({ ...formData, boss_name: e.target.value });
                            if (errors.boss_name) {
                                setErrors({ ...errors, boss_name: '' });
                            }
                        }}
                    />
                    {errors.boss_name && <p className='mt-1 text-sm text-red-600'>{errors.boss_name}</p>}
                </div>
                <div>
                    <label className='block text-sm font-medium mb-1 text-gray-700'>Телефон</label>
                    <input
                        required
                        type='text'
                        maxLength={20}
                        className={`w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 ${errors.phone ? 'border-red-500' : ''}`}
                        value={formData.phone}
                        onChange={(e) => {
                            setFormData({ ...formData, phone: e.target.value });
                            if (errors.phone) {
                                setErrors({ ...errors, phone: '' });
                            }
                        }}
                    />
                    {errors.phone && <p className='mt-1 text-sm text-red-600'>{errors.phone}</p>}
                </div>
                <div>
                    <label className='block text-sm font-medium mb-1 text-gray-700'>Этаж</label>
                    <input
                        required
                        type='number'
                        min='1'
                        max='200'
                        className={`w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 ${errors.floor ? 'border-red-500' : ''}`}
                        value={formData.floor}
                        onChange={(e) => {
                            setFormData({ ...formData, floor: e.target.value });
                            if (errors.floor) {
                                setErrors({ ...errors, floor: '' });
                            }
                        }}
                    />
                    {errors.floor && <p className='mt-1 text-sm text-red-600'>{errors.floor}</p>}
                </div>
                <div className='md:col-span-2 flex justify-end'>
                    <button
                        type='submit'
                        className='bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium flex items-center space-x-2'
                    >
                        <PlusCircle className='w-5 h-5' />{' '}
                        <span>{isEditing ? 'Обновить отдел' : 'Добавить отдел'}</span>
                    </button>
                </div>
            </form>

            <div className='overflow-x-auto rounded-lg border border-gray-200'>
                <table className='min-w-full divide-y divide-gray-200'>
                    <thead className='bg-gray-50'>
                        <tr>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                                Название
                            </th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                                Начальник
                            </th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>Телефон</th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>Этаж</th>
                            <th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase'>
                                Действия
                            </th>
                        </tr>
                    </thead>
                    <tbody className='bg-white divide-y divide-gray-200'>
                        {items.map((item) => (
                            <tr key={item.id} className='hover:bg-gray-50 transition-colors'>
                                <td className='px-6 py-4 whitespace-nowrap'>{item.name}</td>
                                <td className='px-6 py-4 whitespace-nowrap'>{item.boss_name}</td>
                                <td className='px-6 py-4 whitespace-nowrap'>{item.phone}</td>
                                <td className='px-6 py-4 whitespace-nowrap'>{item.floor}</td>
                                <td className='px-6 py-4 text-right space-x-3'>
                                    <button
                                        onClick={() => handleEdit(item)}
                                        className='text-indigo-600 hover:text-indigo-900 transition-colors'
                                    >
                                        <Edit2 className='w-5 h-5 inline' />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(item.id)}
                                        className='text-red-600 hover:text-red-900 transition-colors'
                                    >
                                        <Trash2 className='w-5 h-5 inline' />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {items.length === 0 && (
                            <tr>
                                <td colSpan='5' className='px-6 py-12 text-center text-gray-500'>
                                    Нет данных для отображения
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
