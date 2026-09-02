/**
 * Firebase phone auth requires E.164 format ("+821012345678"), but we don't want
 * users to type their country code by hand. Given a dial code like "+82" and a
 * local number like "010 1234 5678", this strips non-digits, drops a leading
 * trunk "0" (common in Korea, Japan, the UK, etc. — 010... -> 10...), and
 * joins them.
 */
export function toE164(dialCode, localNumber) {
  const digitsOnly = localNumber.replace(/\D/g, '');
  const withoutLeadingZero = digitsOnly.replace(/^0+/, '');
  return `${dialCode}${withoutLeadingZero}`;
}
