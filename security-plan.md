# Implementation Plan: Desktop Application Anti-Copy Security

To prevent unauthorized users from simply copying the application folder and running it on another computer, we need a robust, offline-capable licensing system. We will implement a combination of **Hardware Fingerprinting**, **Cryptographic Licensing**, and **Code Protection**.

## Proposed Mechanisms

### 1. Hardware Binding (Device Fingerprinting)
We will lock the application installation to the physical hardware of the machine it resides on.
- **Implementation**: We will integrate a mechanism (e.g., using the `node-machine-id` library or native `wmic` calls on Windows) to generate a unique Hardware ID (HWID) based on the machine's permanent hardware (Motherboard UUID, CPU ID, Hard Drive Serial).
- **Result**: Even if the entire application directory is copied to a USB drive and glued onto another PC, the HWID will change, instantly invalidating the session.

### 2. Cryptographic License Keys (Offline DRM)
Since the app needs to operate independently (potentially offline), we cannot rely solely on a cloud "ping". We will use asymmetric cryptography (RSA).
- **The System**: 
  - We generate an RSA Key Pair. The **Private Key** is kept strictly by you (the vendor). The **Public Key** is hardcoded into the application.
  - When you sell or authorize a node, you ask for their HWID. You use your private key to sign a specialized string containing their `HWID + Expiry Date + Tenant ID`, producing a `license.key` file.
- **The Check**: When the desktop app starts (inside `electron-main.cjs` or the NestJS boot process), it reads the local HWID and validates `license.key` using the built-in Public Key. If the signature is spoofed, or the HWID doesn't match, the app terminates or launches a "Lock Screen" demanding a valid key.

### 3. Code Protection & Obfuscation (Anti-Tamper)
All DRM logic is useless if a user can simply unpack the `.asar` file and change `if (!licenseValid)` to `if (true)`.
- **Obfuscation**: We will integrate an obfuscator (like `javascript-obfuscator`) during your build pipeline, focusing specifically on the licensing validation logic and the backend server bootstrap.
- **V8 Bytecode (Optional/Advanced)**: If maximum security is desired, we can configure the build to transform critical `.js` files into unreadable V8 bytecode (`.jsc` files) using Bytenode, preventing reverse engineering.

---

## Technical Implementation Steps

### Phase 1: Licensing Core
#### [NEW] `backend/src/common/security/license.service.ts`
- Implement HWID generation logic.
- Implement RSA signature verification.
- Provide a strict initialization hook that stops the NestJS bootstrap if the license is missing or invalid.

#### [NEW] `frontend/src/pages/LicenseLock.tsx`
- A dedicated, un-bypassable screen that appears in the Electron app when the license is missing or invalid.
- It will display the machine's HWID and prompt the user to paste their License Key string or upload a license file.

### Phase 2: Electron & Backend Integration
#### [MODIFY] `frontend/electron-main.cjs`
- Ensure the main window checks the backend for license status. If the backend refuses to serve API requests due to a license failure, intercept this and route the UI to the `LicenseLock` screen.

#### [MODIFY] `backend/src/main.ts`
- Inject the license check right before `app.listen()`.

### Phase 3: Generator Tooling (For You)
#### [NEW] `scripts/license-generator.js`
- A secure CLI tool (not bundled with the final app) that you will keep. You input an HWID and an Expiry Date, and it spits out the cryptographically signed license keys to give to your clients.

## Open Questions & Review

> [!IMPORTANT]
> **User Feedback Required**
> 1. **Offline Requirement**: Do you prefer this purely offline cryptographic approach, or do you want the app to "phone home" to your Super Admin server occasionally to reverify?
> 2. **Code Obfuscation**: Obfuscation adds build time complexity. Do you want basic obfuscation, or are you comfortable with just compiled TypeScript for now with the RSA lock?
> 3. **Trial Mode**: Do you want a 14-day fully-functional grace period if no license is present, or strict zero-tolerance (no start without key)?
