export const dateFormater = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
});

export function generateInputDateValue(date: Date): string {
  // Extract the year, month, and day from the current date
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");

  // Format the date as "yyyy-MM-dd"
  return `${year}-${month}-${day}`;
}
