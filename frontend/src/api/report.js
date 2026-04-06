import api from './api';

export const getReport = (month, year) => {
    const params = new URLSearchParams({
        month: String(month),
        year: String(year),
    });
    return api.get(`/report.php?${params.toString()}`).then((r) => r.data);
};

export const getReportDates = () => {
    return api.get('/report_dates.php').then((r) => r.data);
};
