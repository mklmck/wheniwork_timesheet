// helpers.js

// Parses RFC3339 date strings into Date objects.
const parseDate = (dateString) => new Date(dateString);

// Gets the start of the week for a given date.
const getStartOfWeek = (date) => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0); // Reset hours to midnight.
  // Set to the last Sunday (0 represents Sunday in `getDay`).
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
  return start;
};

// Calculates hours between two dates.
const calculateHours = (start, end) => (end - start) / (1000 * 60 * 60); // Convert milliseconds to hours.

// Checks for overlapping shifts.
const checkOverlap = (shift, shifts) => {
  const start = parseDate(shift.StartTime);
  const end = parseDate(shift.EndTime);
  return shifts.some((otherShift) => {
    if (
      shift.EmployeeID === otherShift.EmployeeID &&
      shift.ShiftID !== otherShift.ShiftID
    ) {
      const otherStart = parseDate(otherShift.StartTime);
      const otherEnd = parseDate(otherShift.EndTime);
      return start < otherEnd && end > otherStart;
    }
    return false;
  });
};

module.exports = {
  parseDate,
  getStartOfWeek,
  calculateHours,
  checkOverlap,
};
