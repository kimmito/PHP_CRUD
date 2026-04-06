import { useState, useEffect } from 'react';
import { Edit2, Trash2, PlusCircle } from 'lucide-react';
import { getSales, createSale, updateSale, removeSale } from '../../api/sales';
import { getProducts } from '../../api/products';

export default function Sales() {
    const [items, setItems] = useState([]);
    const [products, setProducts] = useState([]);
    const [formData, setFormData] = useState({ sale_date: '', product_id: '', quantity: '', retail_price: '' });
    const [errors, setErrors] = useState({});
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);

    const validateFormData = (data) => {
        const fieldErrors = {};
        const saleDate = data.sale_date;
        const productId = Number(data.product_id);
        const quantity = Number(data.quantity);
        const retailPrice = Number(data.retail_price);

        if (!saleDate) {
            fieldErrors.sale_date = 'Укажите дату продажи';
        }

        if (!Number.isInteger(productId) || productId <= 0) {
            fieldErrors.product_id = 'Выберите товар';
        }

        if (!Number.isInteger(quantity) || quantity <= 0) {
            fieldErrors.quantity = 'Количество должно быть целым числом больше 0';
        }

        if (!Number.isFinite(retailPrice) || retailPrice <= 0) {
            fieldErrors.retail_price = 'Цена должна быть больше 0';
        }

        return fieldErrors;
    };

    const formatPrice = (value) => {
        const numeric = Number(value);
        if (!Number.isFinite(numeric)) {
            return '-';
        }
        return numeric.toLocaleString('ru-RU');
    };

    async function loadItems() {
        try {
            const res = await getSales();
            setItems(Array.isArray(res) ? res : []);
        } catch (e) {
            console.error(e);
        }
    }

    async function loadProducts() {
        try {
            const res = await getProducts();
            setProducts(Array.isArray(res) ? res : []);
        } catch (e) {
            console.error(e);
        }
    }

    useEffect(() => {
        (async () => {
            await loadItems();
            await loadProducts();
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
            sale_date: formData.sale_date,
            product_id: Number(formData.product_id),
            quantity: Number(formData.quantity),
            retail_price: Number(formData.retail_price),
        };

        try {
            if (isEditing) {
                await updateSale(editId, payload);
            } else {
                await createSale(payload);
            }
            setFormData({ sale_date: '', product_id: '', quantity: '', retail_price: '' });
            setIsEditing(false);
            setEditId(null);
            loadItems();
        } catch {
            alert('Ошибка при сохранении');
        }
    };

    const handleEdit = (item) => {
        setFormData({
            sale_date: item.sale_date,
            product_id: String(item.product_id),
            quantity: item.quantity,
            retail_price: item.retail_price ?? '',
        });
        setErrors({});
        setIsEditing(true);
        setEditId(item.id);
    };

    const handleDelete = async (id) => {
        if (!confirm('Удалить продажу?')) return;
        try {
            await removeSale(id);
            loadItems();
        } catch {
            alert('Ошибка удаления');
        }
    };

    return (
        <div className='bg-white rounded p-6 max-w-5xl mx-auto'>
            <h2 className='text-2xl font-bold mb-6'>Список продаж</h2>

            <form onSubmit={handleSubmit} className='mb-8 bg-gray-50 p-6 rounded border grid grid-cols-2 gap-4'>
                <div>
                    <label className='block text-sm font-medium mb-1 text-gray-700'>Дата продажи</label>
                    <input
                        required
                        type='date'
                        className={`w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 ${errors.sale_date ? 'border-red-500' : ''}`}
                        value={formData.sale_date}
                        onChange={(e) => {
                            setFormData({ ...formData, sale_date: e.target.value });
                            if (errors.sale_date) {
                                setErrors({ ...errors, sale_date: '' });
                            }
                        }}
                    />
                    {errors.sale_date && <p className='mt-1 text-sm text-red-600'>{errors.sale_date}</p>}
                </div>
                <div>
                    <label className='block text-sm font-medium mb-1 text-gray-700'>Товар</label>
                    <select
                        required
                        className={`w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 ${errors.product_id ? 'border-red-500' : ''}`}
                        value={formData.product_id}
                        onChange={(e) => {
                            const selectedId = e.target.value;
                            const selectedProduct = products.find((prod) => String(prod.id) === selectedId);
                            setFormData({
                                ...formData,
                                product_id: selectedId,
                                retail_price: selectedProduct ? String(selectedProduct.retail_price) : '',
                            });
                            if (errors.product_id || errors.retail_price) {
                                setErrors({ ...errors, product_id: '', retail_price: '' });
                            }
                        }}
                    >
                        <option value=''>Выберите товар</option>
                        {products.map((prod) => (
                            <option key={prod.id} value={prod.id}>
                                {prod.name}
                            </option>
                        ))}
                    </select>
                    {errors.product_id && <p className='mt-1 text-sm text-red-600'>{errors.product_id}</p>}
                </div>
                <div>
                    <label className='block text-sm font-medium mb-1 text-gray-700'>Кол-во шт проданных</label>
                    <input
                        required
                        type='number'
                        min='1'
                        step='1'
                        className={`w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 ${errors.quantity ? 'border-red-500' : ''}`}
                        value={formData.quantity}
                        onChange={(e) => {
                            setFormData({ ...formData, quantity: e.target.value });
                            if (errors.quantity) {
                                setErrors({ ...errors, quantity: '' });
                            }
                        }}
                    />
                    {errors.quantity && <p className='mt-1 text-sm text-red-600'>{errors.quantity}</p>}
                </div>
                <div>
                    <label className='block text-sm font-medium mb-1 text-gray-700'>Розничная цена (₽)</label>
                    <input
                        required
                        type='number'
                        step='0.01'
                        min='0.01'
                        className={`w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 ${errors.retail_price ? 'border-red-500' : ''}`}
                        value={formData.retail_price}
                        onChange={(e) => {
                            setFormData({ ...formData, retail_price: e.target.value });
                            if (errors.retail_price) {
                                setErrors({ ...errors, retail_price: '' });
                            }
                        }}
                    />
                    {errors.retail_price && <p className='mt-1 text-sm text-red-600'>{errors.retail_price}</p>}
                </div>
                <div className='lg:col-span-4 flex justify-end'>
                    <button
                        type='submit'
                        className='bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium flex items-center space-x-2'
                    >
                        <PlusCircle className='w-5 h-5' />{' '}
                        <span>{isEditing ? 'Обновить продажу' : 'Добавить продажу'}</span>
                    </button>
                </div>
            </form>

            <div className='overflow-x-auto rounded-lg border border-gray-200'>
                <table className='min-w-full divide-y divide-gray-200'>
                    <thead className='bg-gray-50'>
                        <tr>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>Дата</th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>Товар</th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>Кол-во</th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                                Рознич. Цена (₽)
                            </th>
                            <th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase'>
                                Действия
                            </th>
                        </tr>
                    </thead>
                    <tbody className='bg-white divide-y divide-gray-200'>
                        {items.map((item) => (
                            <tr key={item.id} className='hover:bg-gray-50 transition-colors'>
                                <td className='px-6 py-4 whitespace-nowrap'>{item.sale_date}</td>
                                <td className='px-6 py-4 whitespace-nowrap'>{item.product_name}</td>
                                <td className='px-6 py-4 whitespace-nowrap'>{item.quantity} шт</td>
                                <td className='px-6 py-4 whitespace-nowrap text-green-600 font-medium'>
                                    {formatPrice(item.retail_price)} ₽
                                </td>
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
                                <td colSpan='5' className='px-6 py-8 text-center text-gray-500'>
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
