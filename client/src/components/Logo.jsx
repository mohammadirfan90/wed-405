// Recreates the supplied reference logo:
// rounded lavender/pink tile, camera icon, and the words
// "Chronos Moments" in a cursive script. Pure SVG so it scales crisply.
// `tone` switches the palette so it works on both light and dark surfaces.
export default function Logo({ size = 96, className = '', tone = 'light' }) {
  const width = size * 2.4;
  const height = size * 1.2;
  return (
    <div
      className={'relative inline-flex items-center justify-center bg-[#171518] rounded-xl shadow-md border border-white/10 overflow-hidden ' + className}
      style={{ width: width, height: height }}
    >
      <img
        src="/biyebuzz_logo.png"
        alt="BiyeBuzz.com"
        className="absolute object-contain"
        style={{
          width: '200%',
          height: '200%',
          maxWidth: 'none',
          maxHeight: 'none',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)'
        }}
      />
    </div>
  );
}
