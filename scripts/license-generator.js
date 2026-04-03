const fs = require('fs');
const crypto = require('crypto');
const readline = require('readline');

// The private key must be kept secure by the vendor and not shipped with the app
const privateKeyPath = './private.pem';

if (!fs.existsSync(privateKeyPath)) {
  console.error('Error: private.pem not found. Generate keys first.');
  process.exit(1);
}

const privateKey = fs.readFileSync(privateKeyPath, 'utf8');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('=== Pharmacy Desktop App - License Generator ===\n');

rl.question('Enter Client Hardware ID (HWID): ', (hwid) => {
  if (!hwid.trim()) {
    console.error('HWID is required.');
    process.exit(1);
  }

  rl.question('Enter Expiry Date (YYYY-MM-DD) or leave blank for lifetime: ', (expiryInput) => {
    rl.question('Enter Subscription Plan (e.g. GOLD, SILVER) or leave blank: ', (plan) => {
      
      const payload = {
        hwid: hwid.trim()
      };

      if (expiryInput.trim()) {
        payload.expiry = new Date(expiryInput.trim()).toISOString();
      }

      if (plan.trim()) {
        payload.plan = plan.trim();
      }

      // Sort keys to ensure deterministic stringification for signature verification
      const dataString = JSON.stringify(payload, Object.keys(payload).sort());
      
      const signer = crypto.createSign('SHA256');
      signer.update(dataString);
      signer.end();
      
      const signature = signer.sign(privateKey, 'base64');
      
      const finalLicenseObject = {
        ...payload,
        signature
      };

      const finalLicenseJson = JSON.stringify(finalLicenseObject, null, 2);
      
      console.log('\n=========================================');
      console.log('SUCCESS! Give this license block to the client:');
      console.log('-----------------------------------------');
      console.log(finalLicenseJson);
      console.log('=========================================\n');
      
      fs.writeFileSync('./generated_license.key', finalLicenseJson);
      console.log('Also saved to ./generated_license.key');
      
      rl.close();
    });
  });
});
