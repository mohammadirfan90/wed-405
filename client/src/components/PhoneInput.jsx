// A contact-number input that always sends "+880" as the country code prefix.
// Matches the design: small "+880" chip on the left, big input on the right.
export default function PhoneInput({ value, onChange, name = 'phone', required, autoComplete = 'tel' }) {
  // We treat the field as the FULL international string but visually show a
  // fixed +880 chip. Users still type the rest of the number.
  const prefix = '+880';
  const rest = value?.startsWith(prefix) ? value.slice(prefix.length) : (value || '');

  return (
    <div className="flex">
      <span
        aria-hidden
        className="inline-flex select-none items-center rounded-l-lg border border-r-0 border-lav-300 bg-lav-200/60 px-3 text-sm font-semibold text-ink-muted"
      >
        {prefix}
      </span>
      <input
        type="tel"
        inputMode="numeric"
        autoComplete={autoComplete}
        required={required}
        name={name}
        value={rest}
        onChange={(e) => {
          // strip non-digits so the value is always "+880XXXXXXXXX"
          const digits = e.target.value.replace(/\D/g, '').slice(0, 12);
          onChange({ target: { name, value: prefix + digits } });
        }}
        placeholder="1XXXXXXXXX"
        className="input-field rounded-l-none"
      />
    </div>
  );
}
