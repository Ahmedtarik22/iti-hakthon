export function daysBetween(start, end) {
  const s = new Date(start);
  const e = new Date(end);
  s.setHours(0, 0, 0, 0);
  e.setHours(0, 0, 0, 0);
  return Math.max(0, Math.floor((e - s) / (1000 * 60 * 60 * 24)));
}

export function calculateFine(expectedReturnDate, actualReturnDate, dailyRate) {
  const daysOverdue = daysBetween(expectedReturnDate, actualReturnDate);
  const fineAmount = daysOverdue * dailyRate;
  return { daysOverdue, fineAmount, isOnTime: daysOverdue === 0 };
}
