export function generatePassword(
  length: number,
  options: { lower: boolean; upper: boolean; numbers: boolean; symbols: boolean; excludeLookAlikes: boolean }
) {
  const lower = "abcdefghijklmnopqrstuvwxyz";
  const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numbers = "0123456789";
  const symbols = "!@#$%^&*()_+-=[]{}|;:,.<>?";

  let chars = "";
  if (options.lower) chars += lower;
  if (options.upper) chars += upper;
  if (options.numbers) chars += numbers;
  if (options.symbols) chars += symbols;

  // Remove look-alike characters if option is checked
  if (options.excludeLookAlikes) {
    chars = chars.replace(/[il1Lo0O]/g, "");
  }

  let password = "";
  for (let i = 0; i < length; i++) {
    const index = Math.floor(Math.random() * chars.length);
    password += chars[index];
  }

  return password;
}
