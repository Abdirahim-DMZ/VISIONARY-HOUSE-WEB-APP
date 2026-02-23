/**
 * International phone number validation using libphonenumber-js.
 * Supports all countries and returns clear error reasons.
 */

import {
  parsePhoneNumberFromString,
  type CountryCode,
  type ParseError,
} from "libphonenumber-js";

export interface PhoneValidationResult {
  valid: boolean;
  /** E.164 format (e.g. +12125551234) when valid */
  normalized?: string;
  /** User-friendly error message when invalid */
  errorMessage?: string;
}

/**
 * Validate and normalize an international phone number.
 * Accepts input with + or 00 prefix and common formatting (spaces, dashes, parentheses).
 * Uses libphonenumber-js for country-aware validation (all countries supported).
 *
 * @param value - Raw input (e.g. "+1 (555) 123-4567", "+44 20 7123 4567", "+91 98765 43210")
 * @param defaultCountry - Optional default country code (e.g. "US") when number is entered without + prefix
 */
export function validateInternationalPhone(
  value: string,
  defaultCountry?: CountryCode
): PhoneValidationResult {
  const trimmed = (value ?? "").trim();
  if (!trimmed) {
    return { valid: false, errorMessage: "Please enter your phone number." };
  }

  // Require international format (+ or 00) unless defaultCountry is set
  if (!defaultCountry) {
    const hasPlus = trimmed.startsWith("+");
    const hasDoubleZero = trimmed.startsWith("00");
    if (!hasPlus && !hasDoubleZero) {
      return {
        valid: false,
        errorMessage: "Include country code (e.g. +1, +44, +91, +61).",
      };
    }
  }

  try {
    const parsed = parsePhoneNumberFromString(trimmed, defaultCountry ?? undefined);
    if (!parsed) {
      return {
        valid: false,
        errorMessage: "Enter a valid phone number with country code.",
      };
    }
    if (!parsed.isValid()) {
      return {
        valid: false,
        errorMessage: "This phone number is not valid for the country.",
      };
    }
    return {
      valid: true,
      normalized: parsed.format("E.164"),
    };
  } catch (err) {
    const parseError = err as ParseError;
    const reason = parseError?.message ?? "";
    if (reason.includes("INVALID_COUNTRY") || reason.includes("NOT_A_NUMBER")) {
      return {
        valid: false,
        errorMessage: "Enter a valid phone number with country code.",
      };
    }
    if (reason.includes("TOO_SHORT") || reason.includes("TOO_LONG")) {
      return {
        valid: false,
        errorMessage: "Phone number has an invalid length for this country.",
      };
    }
    return {
      valid: false,
      errorMessage: "Enter a valid international phone number.",
    };
  }
}

/**
 * Check if a phone number is valid (convenience wrapper).
 */
export function isValidInternationalPhone(
  value: string,
  defaultCountry?: CountryCode
): boolean {
  return validateInternationalPhone(value, defaultCountry).valid;
}

/**
 * Normalize phone to E.164 format (+ and digits only).
 * Returns empty string if invalid or empty.
 */
export function normalizeInternationalPhone(
  value: string,
  defaultCountry?: CountryCode
): string {
  const result = validateInternationalPhone(value, defaultCountry);
  return result.valid && result.normalized ? result.normalized : "";
}
