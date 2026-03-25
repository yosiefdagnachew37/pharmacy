import fs from 'fs/promises'; fs.chmod('test', '755').catch(e => console.log('NOT INTERCEPTED'));
