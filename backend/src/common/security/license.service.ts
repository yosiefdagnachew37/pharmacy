import { Injectable, Logger } from '@nestjs/common';
import { machineIdSync } from 'node-machine-id';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

export interface LicenseData {
  hwid: string;
  tenantId?: string;
  expiry?: string; 
  plan?: string;
  signature?: string;
}

@Injectable()
export class LicenseService {
  private readonly logger = new Logger(LicenseService.name);
  
  // Embedded Public Key for offline RSA validation
  private readonly publicKey = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAoIq72ekH+vaKRz14pYWh
8dnuw1vDZErj0xi0NmAfEVoifYn3kmB+1/EUSJd4ZNV4iDMdQSQcWjf9UEGc1IX1
5r2gD0kUqFXZ4Oa9PuOCQOwjnUz9p55gcNhTWxa+wkXHVxWiq/kJ7SCS/aaoMxZc
J7stBEexEPcl5b9tvT6yHR7oLmrWosrd1hav1dFT03puqZ57hZ89SEX3eLrhlnk6
d92fGwz1AYStuNnLIuiu6w1f/ph2FHhQTP4epBEz2mBN1xBk02J1FXubjcWYby3R
Ndc518BKyI0fFzxuem5GNXZOFOdQ1RtWwq+oEAMnP2vPXuLzlJx2NUtkdDnXTGYG
RwIDAQAB
-----END PUBLIC KEY-----`;

  /**
   * Retrieves the physical hardware ID associated with the machine.
   * Based on CPU/Motherboard/Disk identifiers.
   */
  public getHardwareId(): string {
    try {
      return machineIdSync();
    } catch (err) {
      this.logger.error('Failed to generate HWID', err);
      // Fallback pseudo-HWID in case native wmic calls fail (e.g., restrictive sandboxes)
      return crypto.createHash('sha256').update(require('os').hostname()).digest('hex').substring(0, 32);
    }
  }

  /**
   * Reads and validates the local license.key file against the hardware.
   * Returns true if authorized, false otherwise.
   */
  public validateLicense(): { isValid: boolean; reason: string; hwid: string } {
    const hwid = this.getHardwareId();
    
    // Look for the license file in the current working directory, or the appData path if bundled
    let licensePath = path.join(process.cwd(), 'license.key');
    
    // Fallback search logic for Electron environments
    if (!fs.existsSync(licensePath)) {
      // In production packaged mode, the cwd is usually the app bundle folder
      const userDataPath = process.env.APPDATA 
        ? path.join(process.env.APPDATA, 'pharmacy-system') // Just an example, maybe not the actual name, let's just stick to cwd and adjacent directories
        : '';
        
      if (userDataPath && fs.existsSync(path.join(userDataPath, 'license.key'))) {
        licensePath = path.join(userDataPath, 'license.key');
      } else {
        const potentialPath = path.join(process.cwd(), '..', 'license.key');
        if (fs.existsSync(potentialPath)) {
          licensePath = potentialPath;
        } else {
          return { isValid: false, reason: 'License file not found.', hwid };
        }
      }
    }

    try {
      const licenseRaw = fs.readFileSync(licensePath, 'utf-8');
      const licenseObj = JSON.parse(licenseRaw) as LicenseData;

      if (!licenseObj.hwid || !licenseObj.signature) {
        return { isValid: false, reason: 'Corrupted license format.', hwid };
      }

      // Check hardware mismatch
      if (licenseObj.hwid !== hwid) {
        return { isValid: false, reason: 'Hardware ID mismatch. This license belongs to another machine.', hwid };
      }

      // Check Cryptographic Signature
      const { signature, ...dataPayload } = licenseObj;
      const dataString = JSON.stringify(dataPayload, Object.keys(dataPayload).sort());
      
      const verify = crypto.createVerify('SHA256');
      verify.update(dataString);
      
      const isValidSig = verify.verify(this.publicKey, signature, 'base64');
      
      if (!isValidSig) {
        return { isValid: false, reason: 'Invalid signature. License was tampered with or is illegitimate.', hwid };
      }

      // Optional: Check Expiry Date
      if (licenseObj.expiry) {
        const expiryDate = new Date(licenseObj.expiry);
        if (new Date() > expiryDate) {
          return { isValid: false, reason: 'License has expired.', hwid };
        }
      }

      return { isValid: true, reason: 'Authorized', hwid };
    } catch (err) {
      this.logger.error('Error parsing license file', err);
      return { isValid: false, reason: 'Failed to read or parse license file.', hwid };
    }
  }

  /**
   * Applies a new license by writing it to the root directory
   */
  public applyLicense(licenseString: string): boolean {
    const hwid = this.getHardwareId();
    try {
      const licenseObj = JSON.parse(licenseString) as LicenseData;
      
      // We will perform a quick check
      if (licenseObj.hwid !== hwid) {
        throw new Error('This license key was generated for a different Hardware ID.');
      }

      const { signature, ...dataPayload } = licenseObj;
      const dataString = JSON.stringify(dataPayload, Object.keys(dataPayload).sort());
      
      const verify = crypto.createVerify('SHA256');
      verify.update(dataString);
      
      const isValidSig = verify.verify(this.publicKey, signature as string, 'base64');
      if (!isValidSig) {
        throw new Error('Manipulated or fake license cryptographic signature.');
      }

      if (licenseObj.expiry) {
        const expiryDate = new Date(licenseObj.expiry);
        if (new Date() > expiryDate) {
          throw new Error('This license key has already expired.');
        }
      }

      fs.writeFileSync(path.join(process.cwd(), 'license.key'), licenseString, 'utf-8');
      return true;
    } catch (err: any) {
      this.logger.error('Failed to apply license', err.message);
      throw err;
    }
  }
}
