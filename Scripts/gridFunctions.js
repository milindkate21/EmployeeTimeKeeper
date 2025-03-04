export function getFormattedFilename() {
  let today = new Date();
  let month = today.toLocaleString("en-US", { month: "short" }); // Short month name
  let day = today.getDate();
  let year = today.getFullYear();
  return `Report_${month}_${day}_${year}`;
}

export function formatDateToShortFormat(date) {
  const [year, month, day] = date.split("-").map(Number); // Extract year, month, day
  const dateObj = new Date(year, month - 1, day); // Months are 0-based in JS Date

  const options = { year: "numeric", month: "short", day: "numeric" };
  return dateObj.toLocaleDateString("en-US", options);
}

export function formatDateToLongFormat(date) {
  const dateObj = new Date(date);
  const options = { year: "numeric", month: "long", day: "numeric" };
  return dateObj.toLocaleDateString("en-US", options); // November 14, 2024
}
