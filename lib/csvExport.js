export const downloadCSV = (data) => {
  const headers = ['שם', 'טלפון', 'אימייל', 'סטטוס', 'תאריך פתיחה'];
  
  const csvRows = data.map(customer => [
    customer.name,
    customer.phone,
    customer.email || '',
    customer.status,
    new Date(customer.createdAt).toLocaleDateString('he-IL')
  ]);

  // הגדרת תוכן ה-CSV
  const content = [headers, ...csvRows]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n');

  // הוספת BOM לצורך פתיחה תקינה של עברית באקסל
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + content], { type: 'text/csv;charset=utf-8;' });
  
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'customers_export.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
