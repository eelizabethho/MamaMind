export const getDaysInMonth = (month: number, year: number): number => {
  // Leap Year Calculator:
  // If year is divisible by 4 but not 100, or is divisible by 400, it's a leap year.
  if (month === 1) {
    // February (0-indexed)
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0 ? 29 : 28;
  }
  return [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month];
};

export const getFirstDayOfMonth = (month: number, year: number): number => {
  return new Date(year, month, 1).getDay();
};
