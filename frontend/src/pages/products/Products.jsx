import { useState, useEffect } from 'react';
import { Edit2, Trash2, PlusCircle } from 'lucide-react';
import { getProducts, createProduct, updateProduct, removeProduct } from '../../api/products';
import { getDepartments } from '../../api/departments';

export default function Products() {
    const [items, setItems] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        supplier: '',
        retail_price: '',
        arrival_date: '',
        department_id: '',
    });
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);

    async function loadItems() {
        try {
            const res = await getProducts();
            setItems(Array.isArray(res) ? res : []);
        } catch (e) {
            console.error(e);
        }
    }

    async function loadDepartments() {
        try {
            const res = await getDepartments();
            setDepartments(Array.isArray(res) ? res : []);
        } catch (e) {
            console.error(e);
        }
    }

    useEffect(() => {
        (async () => {
            await loadItems();
            await loadDepartments();
        })();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                await updateProduct(editId, formData);
            } else {
                await createProduct(formData);
            }
            setFormData({ name: '', supplier: '', retail_price: '', arrival_date: '', department_id: '' });
            setIsEditing(false);
            setEditId(null);
            loadItems();
        } catch {
            alert('Ошибка при сохранении');
        }
    };

    const handleEdit = (item) => {
        setFormData({
            name: item.name,
            supplier: item.supplier,
            retail_price: (item.retail_price ?? ''),
            arrival_date: item.arrival_date,
            department_id: String(item.department_id),
        });
        setIsEditing(true);
        setEditId(item.id);
    };

    const handleDelete = async (id) => {
        if (!confirm('Удалить товар?')) return;
        try {
            const res = await removeProduct(id);
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
            <h2 className='text-2xl font-bold mb-6'>Справочник товаров</h2>

            <form onSubmit={handleSubmit} className='mb-8 bg-gray-50 p-6 rounded border grid grid-cols-2 gap-4'>
                <div>
                    <label className='block text-sm font-medium mb-1 text-gray-700'>Название товара</label>
                    <input
                        required
                        type='text'
                        className='w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500'
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                </div>
                <div>
                    <label className='block text-sm font-medium mb-1 text-gray-700'>Поставщик</label>
                    <input
                        required
                        type='text'
                        className='w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500'
                        value={formData.supplier}
                        onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                    />
                </div>
                <div>
                    <label className='block text-sm font-medium mb-1 text-gray-700'>Розничная Цена (₽)</label>
                    <input
                        required
                        type='number'
                        step='0.01'
                        className='w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500'
                        value={formData.retail_price}
                        onChange={(e) => setFormData({ ...formData, retail_price: e.target.value })}
                    />
                </div>
                <div>
                    <label className='block text-sm font-medium mb-1 text-gray-700'>Дата поступления</label>
                    <input
                        required
                        type='date'
                        className='w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500'
                        value={formData.arrival_date}
                        onChange={(e) => setFormData({ ...formData, arrival_date: e.target.value })}
                    />
                </div>
                <div>
                    <label className='block text-sm font-medium mb-1 text-gray-700'>Отдел</label>
                    <select
                        required
                        className='w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500'
                        value={formData.department_id}
                        onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
                    >
                        <option value=''>Выберите отдел</option>
                        {departments.map((dep) => (
                            <option key={dep.id} value={dep.id}>
                                {dep.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div className='lg:col-span-3 flex justify-end'>
                    <button
                        type='submit'
                        className='bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium flex items-center space-x-2'
                    >
                        <PlusCircle className='w-5 h-5' />{' '}
                        <span>{isEditing ? 'Обновить товар' : 'Добавить товар'}</span>
                    </button>
                </div>
            </form>

            <div className='overflow-x-auto rounded-lg border border-gray-200'>
                <table className='min-w-full divide-y divide-gray-200'>
                    <thead className='bg-gray-50'>
                        <tr>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>Товар</th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                                Поставщик
                            </th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                                Розн. цена
                            </th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                                Дата пост.
                            </th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>Отдел</th>
                            <th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase'>
                                Действия
                            </th>
                        </tr>
                    </thead>
                    <tbody className='bg-white divide-y divide-gray-200'>
                        {items.map((item) => (
                            <tr key={item.id} className='hover:bg-gray-50 transition-colors'>
                                <td className='px-6 py-4 whitespace-nowrap'>{item.name}</td>
                                <td className='px-6 py-4 whitespace-nowrap'>{item.supplier}</td>
                                <td className='px-6 py-4 whitespace-nowrap font-medium text-green-600'>
                                    {Number(item.retail_price).toLocaleString()} ₽
                                </td>
                                <td className='px-6 py-4 whitespace-nowrap'>{item.arrival_date}</td>
                                <td className='px-6 py-4 whitespace-nowrap'>{item.department_name}</td>
                                <td className='px-6 py-4 text-right space-x-3'>
                                    <button
                                        onClick={() => handleEdit(item)}
                                        className='text-indigo-600 hover:text-indigo-900 transition-colors'
                                    >
                                        <Edit2 className='w-5 h-5 inline' />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(item.id)}
                                        className='text-red-500 hover:text-red-700 transition-colors'
                                    >
                                        <Trash2 className='w-5 h-5 inline' />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {items.length === 0 && (
                            <tr>
                                <td colSpan='6' className='px-6 py-8 text-center text-gray-500'>
                                    Нет данных
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
