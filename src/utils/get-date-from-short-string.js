import format from 'date-fns/format';

function getDateParamsFromString(dateString) {
  return {
    year: dateString.slice(0, 4),
    month: dateString.slice(4, 6),
    date: dateString.slice(6, 8),
  };
}

export function getDateForMemoriesRequest(dateString) {
  const { year, month, date } = getDateParamsFromString(dateString);
  return new Date(year, Number(month) - 1, Number(date) + 1);
}

export function formatDateFromShortString(dateString) {
  const { year, month, date } = getDateParamsFromString(dateString);
  const fullDate = new Date(year, Number(month) - 1, date);
  return format(fullDate, 'MMM d, yyyy');
}
