const REQUIRED = [
  ["fullName", "Full name"],
  ["phone", "Phone"],
  ["addressLine", "Address"],
  ["city", "City"],
  ["province", "Province"],
];

const OPTIONAL = ["postalCode"];

/**
 * Validates and cleans an address coming from the client.
 * Returns { data } on success or { error } with a readable message.
 */
export function validateAddress(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return { error: "Invalid address." };
  }

  const data = {};

  for (const [key, label] of REQUIRED) {
    const value = typeof input[key] === "string" ? input[key].trim() : "";
    if (!value) return { error: `${label} is required.` };
    if (value.length > 200) return { error: `${label} is too long.` };
    data[key] = value;
  }

  for (const key of OPTIONAL) {
    const value = typeof input[key] === "string" ? input[key].trim() : "";
    if (value.length > 20) return { error: "Postal code is too long." };
    data[key] = value;
  }

  if (!/^[+\d][\d\s-]{6,19}$/.test(data.phone)) {
    return { error: "Enter a valid phone number." };
  }

  return { data };
}