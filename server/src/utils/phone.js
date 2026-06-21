// Normalize a user-supplied phone to "+CC..." (E.164-ish).
// Accepts: "8801XXXXXXXXX", "+8801XXXXXXXXX", "01XXXXXXXXX" (assumes BD),
// "1XXXXXXXXX" (assumes +1), or already-correct "+...".
function normalizePhone(raw, defaultCountryCode = '880') {
  if (raw == null) return '';
  let s = String(raw).trim().replace(/[\s\-()]/g, '');
  if (!s) return '';
  if (s.startsWith('+')) return '+' + s.slice(1).replace(/\D/g, '');
  if (s.startsWith('00')) return '+' + s.slice(2).replace(/\D/g, '');
  const digits = s.replace(/\D/g, '');
  if (!digits) return '';
  // Local 0-leading (e.g. 01XXXXXXXXX) -> prepend default country code
  if (digits.startsWith('0')) return '+' + defaultCountryCode + digits.slice(1);
  // Already has country code with no '+'
  if (digits.length >= 10) return '+' + digits;
  return '+' + digits;
}

module.exports = { normalizePhone };
