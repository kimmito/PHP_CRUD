import { useState, useEffect } from 'react';
import { getReport, getReportDates } from '../../api/report';

export default function Report() {
    const now = new Date();
    const [month, setMonth] = useState(now.getMonth() + 1);
    const [year, setYear] = useState(now.getFullYear());
    const [rows, setRows] = useState([]);
    const [totalSum, setTotalSum] = useState(0);
    const [availableDates, setAvailableDates] = useState([]);
    const [datesLoaded, setDatesLoaded] = useState(false);

    const monthNames = [
        'январь',
        'февраль',
        'март',
        'апрель',
        'май',
        'июнь',
        'июль',
        'август',
        'сентябрь',
        'октябрь',
        'ноябрь',
        'декабрь',
    ];

    async function loadDates() {
        try {
            const res = await getReportDates();
            if (res && res.status === 'success') {
                const dates = res.dates || [];
                setAvailableDates(dates);

                if (dates.length > 0) {
                    const latestDate = dates.reduce((latest, item) => {
                        if (item.year > latest.year) return item;
                        if (item.year === latest.year && item.month > latest.month) return item;
                        return latest;
                    }, dates[0]);

                    setYear(latestDate.year);
                    setMonth(latestDate.month);
                }
            }
        } catch (e) {
            console.error(e);
        } finally {
            setDatesLoaded(true);
        }
    }

    useEffect(() => {
        loadDates();
    }, []);

    let availableYears = Array.from(new Set(availableDates.map((d) => d.year))).sort((a, b) => b - a);
    if (availableYears.length === 0) availableYears = [now.getFullYear()];

    let availableMonths = Array.from(new Set(availableDates.filter((d) => d.year === year).map((d) => d.month))).sort(
        (a, b) => a - b,
    );
    if (availableMonths.length === 0) availableMonths = [now.getMonth() + 1];

    useEffect(() => {
        if (availableDates.length === 0) return;

        if (!availableYears.includes(year)) {
            setYear(availableYears[0]);
        } else if (!availableMonths.includes(month)) {
            setMonth(availableMonths[0]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [availableDates, year, month]);

    async function loadReport() {
        if (!datesLoaded || availableDates.length === 0) {
            return;
        }

        const hasSelectedDate = availableDates.some((d) => d.year === year && d.month === month);
        if (!hasSelectedDate) {
            return;
        }

        try {
            const res = await getReport(month, year);
            if (res && Array.isArray(res.rows)) {
                setRows(res.rows);
                setTotalSum(Number(res.total_sum) || 0);
            } else {
                setRows([]);
                setTotalSum(0);
            }
        } catch (e) {
            console.error(e);
            setRows([]);
            setTotalSum(0);
        }
    }
    useEffect(() => {
        (async () => {
            await loadReport();
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [month, year, datesLoaded, availableDates]);

    const groupedByDepartment = rows.reduce((acc, item) => {
        const dep = item.department_name || 'Без отдела';
        if (!acc[dep]) {
            acc[dep] = [];
        }
        acc[dep].push(item);
        return acc;
    }, {});

    return (
        <div className='bg-white rounded p-6 max-w-5xl mx-auto'>
            <h2 className='text-2xl font-bold mb-4'>
                Выручка от продажи товаров за {monthNames[month - 1]} {year} года
            </h2>

            <div className='mb-6 flex gap-3'>
                <select className='border rounded p-2' value={month} onChange={(e) => setMonth(Number(e.target.value))}>
                    {availableMonths.map((m) => (
                        <option key={m} value={m}>
                            {monthNames[m - 1]}
                        </option>
                    ))}
                </select>
                <select className='border rounded p-2' value={year} onChange={(e) => setYear(Number(e.target.value))}>
                    {availableYears.map((y) => (
                        <option key={y} value={y}>
                            {y}
                        </option>
                    ))}
                </select>
            </div>

            <div className='overflow-x-auto rounded-lg border border-gray-200'>
                <table className='min-w-full divide-y divide-gray-200'>
                    <thead className='bg-gray-50'>
                        <tr>
                            <th className='px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase'>
                                Наименование товара
                            </th>
                            <th className='px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase'>
                                Единица измерения
                            </th>
                            <th className='px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase'>
                                Цена розничная, тыс. руб.
                            </th>
                            <th className='px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase'>
                                Количество товара
                            </th>
                            <th className='px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase'>
                                Выручка, тыс. руб.
                            </th>
                        </tr>
                    </thead>
                    <tbody className='bg-white divide-y divide-gray-200'>
                        {Object.entries(groupedByDepartment).map(([departmentName, depRows]) => {
                            const depSum = depRows.reduce((sum, item) => sum + Number(item.total_revenue), 0);
                            return (
                                <>
                                    <tr key={`dep-${departmentName}`} className='bg-gray-50'>
                                        <td colSpan='5' className='px-4 py-3 font-semibold text-gray-800'>
                                            Отдел {departmentName}
                                        </td>
                                    </tr>
                                    {depRows.map((item) => (
                                        <tr key={item.product_id} className='hover:bg-gray-50'>
                                            <td className='px-4 py-3'>{item.product_name}</td>
                                            <td className='px-4 py-3'>шт.</td>
                                            <td className='px-4 py-3 text-right'>
                                                {(Number(item.retail_price) / 1000).toFixed(2)}
                                            </td>
                                            <td className='px-4 py-3 text-right'>{item.total_quantity}</td>
                                            <td className='px-4 py-3 text-right font-medium'>
                                                {(Number(item.total_revenue) / 1000).toFixed(2)}
                                            </td>
                                        </tr>
                                    ))}
                                    <tr key={`sum-${departmentName}`} className='bg-gray-100'>
                                        <td colSpan='4' className='px-4 py-3 text-right font-semibold'>
                                            Итого по отделу:
                                        </td>
                                        <td className='px-4 py-3 text-right font-bold'>{(depSum / 1000).toFixed(2)}</td>
                                    </tr>
                                </>
                            );
                        })}
                        {rows.length === 0 && (
                            <tr>
                                <td colSpan='5' className='px-6 py-12 text-center text-gray-500'>
                                    Пока нет данных для отчета
                                </td>
                            </tr>
                        )}
                    </tbody>
                    <tfoot className='bg-gray-100'>
                        <tr>
                            <td colSpan='4' className='px-4 py-3 text-right font-semibold'>
                                Итого по магазину:
                            </td>
                            <td className='px-4 py-3 text-right font-bold'>{(totalSum / 1000).toFixed(2)}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    );
}
