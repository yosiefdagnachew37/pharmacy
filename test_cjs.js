const fs = require('fs'); fs.promises.chmod = async () => console.log('INTERCEPTED!'); import('./test_esm.mjs');
