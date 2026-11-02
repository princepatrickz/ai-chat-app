export const formatDatetime = (value, timeZone = "Asia/Manila") => {
  if (!value) return "";

  const date = new Date(value);

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone,
  }).format(date);
};
