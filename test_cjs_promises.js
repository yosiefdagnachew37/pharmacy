const fs = require('fs'); fs.promises.chmod = async (p) => console.log('INTERCEPTED: ' + p); import('./test_esm_promises.mjs');
