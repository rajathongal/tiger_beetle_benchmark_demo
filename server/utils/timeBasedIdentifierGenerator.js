const generateTimeBasedIdentifier = () => {
  const now = new Date();

  // Extract date components
  const year = now.getFullYear();
  const month = now.getMonth() + 1; // Months are zero-based
  const day = now.getDate();

  // Extract time components
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();

  return `${year}${pad(month)}${pad(day)}_${pad(hours)}${pad(minutes)}${pad(
    seconds
  )}`;
};

// Helper function to pad single-digit numbers with a leading zero
const pad = (number) => {
  return number < 10 ? `0${number}` : `${number}`;
};

export default generateTimeBasedIdentifier;
