const fs = require('fs');
const p = 'c:/SMUCT_Project/Chonos Moments/client/src/pages/AdminDashboard.jsx';
try {
  if (fs.existsSync(p)) { fs.unlinkSync(p); console.log('DELETED'); }
  else { console.log('NOT_PRESENT'); }
} catch (e) { console.log('ERR', e.code, e.message); }
