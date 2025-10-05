export function generatePassword(length: number, options: {
  lower?: boolean, upper?: boolean, numbers?: boolean, symbols?: boolean, excludeSimilar?: boolean
}) {
  let charset = "";
  if (options.lower) charset += "abcdefghijklmnopqrstuvwxyz";
  if (options.upper) charset += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  if (options.numbers) charset += "0123456789";
  if (options.symbols) charset += "!@#$%^&*()_-+=<>?";
  if (options.excludeSimilar) charset = charset.replace(/[Il1O0]/g, "");

  if (!charset) charset = "abcdefghijklmnopqrstuvwxyz";

  const array = new Uint32Array(length);
  crypto.getRandomValues(array);

  return Array.from(array).map(x => charset[x % charset.length]).join("");
}
