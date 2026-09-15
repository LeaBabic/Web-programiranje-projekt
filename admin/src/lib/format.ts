const currency = new Intl.NumberFormat('hr-HR', { style: 'currency', currency: 'EUR' });
const date = new Intl.DateTimeFormat('hr-HR', { day: '2-digit', month: '2-digit', year: 'numeric' });
const dateTime = new Intl.DateTimeFormat('hr-HR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

export const formatPrice = (value: number) => currency.format(value);
export const formatDate = (value: string | Date) => date.format(new Date(value));
export const formatDateTime = (value: string | Date) => dateTime.format(new Date(value));
