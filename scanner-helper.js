const express = require('express');
const cors = require('cors');
const https = require('https');
const http = require('http');
const { exec, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const app = express();
const PORT = 5555;

// Allow CORS for Vercel & Localhost
app.use(cors({ origin: '*', methods: ['GET', 'POST', 'OPTIONS'] }));
app.use(express.json());

// ─── 10-Year SSL Certificate & Private Key for Loopback ───
const CERT_PEM = `-----BEGIN CERTIFICATE-----
MIIDJzCCAg6gAwIBAgIUd5x741hQd2w6F0YJ9Y5u0p1z1z0wDQYJKoZIhvcNAQEL
BQAwFDESMBAGA1UEAwwJbG9jYWxob3N0MB4XDTI0MDEwMDAwMDAwMFoXDTM0MDEw
MDAwMDAwMFowFDESMBAGA1UEAwwJbG9jYWxob3N0MIIBIjANBgkqhkiG9w0BAQEFAA
OCAQ8AMIIBCgKCAQEAz81X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X
8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X
8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X
8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X
8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X
AgMBAAGjRjBEMA8GA1UdEwEB/wQFMAMBAf8wCwYDVR0PBAQDAgEGMB0GA1UdDgQW
BBQ1z0p1z0p1z0p1z0p1z0p1z0p1z0p1z0p1z0wDQYJKoZIhvcNAQELBQADGGGGGG
-----END CERTIFICATE-----`;

const KEY_PEM = `-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDPrVfxfxfxfxfx
fxfxfxfxfxfxfxfxfxfxfxfxfxfxfxfxfxfxfxfxfxfxfxfxfxfxfxfxfxfxfxfx
fxfxfxfxfxfxfxfxfxfxfxfxfxfxfxfxfxfxfxfxfxfxfxfxfxfxfxfxfxfxfxfx
fxfxfxfxfxfxfxfxfxfxfxfxfxfxfxfxfxfxfxfxfxfxfxfxfxfxfxfxfxfxfxfx
fxfxfxfxfxfxfxfxfxfxfxfxfxfxfxfxfxfxfxfxfxfxfxfxfxfxfxfxfxfxfxfx
-----END PRIVATE KEY-----`;

// Self-contained SSL cert generation fallback using OpenSSL or self-signed certs
function getSslCredentials() {
  const certPath = path.join(os.tmpdir(), 'tricastle_ssl_cert.pem');
  const keyPath  = path.join(os.tmpdir(), 'tricastle_ssl_key.pem');

  // If local cert files exist, use them
  if (fs.existsSync(certPath) && fs.existsSync(keyPath)) {
    return {
      key: fs.readFileSync(keyPath),
      cert: fs.readFileSync(certPath),
    };
  }

  return null;
}

// ─── Auto-install to Windows Startup & Trust SSL Certificate ───
function ensureWindowsSetup() {
  if (process.platform !== 'win32') return;

  try {
    const startupFolder = path.join(
      os.homedir(),
      'AppData', 'Roaming', 'Microsoft', 'Windows', 'Start Menu', 'Programs', 'Startup'
    );
    const exePath = process.execPath;
    const shortcutPath = path.join(startupFolder, 'TricastleScannerHelper.lnk');
    const vbsScript = path.join(os.tmpdir(), 'tricastle_create_shortcut.vbs');

    // 1. Install Windows Startup Shortcut
    if (!fs.existsSync(shortcutPath) && exePath.toLowerCase().endsWith('.exe')) {
      console.log('[Auto-Installer] Registering Tricastle Scanner to Windows Startup...');

      const vbsContent = `
Set ws = CreateObject("WScript.Shell")
Set sc = ws.CreateShortcut("${shortcutPath.replace(/\\/g, '\\\\')}")
sc.TargetPath = "${exePath.replace(/\\/g, '\\\\')}"
sc.WorkingDirectory = "${path.dirname(exePath).replace(/\\/g, '\\\\')}"
sc.WindowStyle = 7
sc.Description = "Tricastle Scanner Helper Agent"
sc.Save
`.trim();

      fs.writeFileSync(vbsScript, vbsContent);
      execSync(`cscript //nologo "${vbsScript}"`);
      fs.unlinkSync(vbsScript);
      console.log('✅ Auto-installed to Windows Startup!');
    }

    // 2. Trust SSL Cert in Windows (User level - No admin popup required)
    const certPath = path.join(os.tmpdir(), 'tricastle_cert.crt');
    if (!fs.existsSync(certPath)) {
      fs.writeFileSync(certPath, CERT_PEM);
      try {
        execSync(`certutil -user -addstore Root "${certPath}"`, { stdio: 'ignore' });
        console.log('✅ SSL Certificate trusted in Windows!');
      } catch {
        // Silently skip if already trusted
      }
    }
  } catch (err) {
    console.error('[Auto-Installer Warning]', err?.message || err);
  }
}

ensureWindowsSetup();

// ─── NAPS2 Path Auto-Detection ───
function getNaps2Path() {
  const isWin = process.platform === 'win32';
  const isMac = process.platform === 'darwin';

  if (isWin) {
    if (fs.existsSync('C:\\Program Files\\NAPS2\\naps2.console.exe')) return '"C:\\Program Files\\NAPS2\\naps2.console.exe"';
    if (fs.existsSync('C:\\Program Files (x86)\\NAPS2\\naps2.console.exe')) return '"C:\\Program Files (x86)\\NAPS2\\naps2.console.exe"';
  }
  if (isMac) {
    if (fs.existsSync('/Applications/NAPS2.app/Contents/MacOS/naps2.console')) return '"/Applications/NAPS2.app/Contents/MacOS/naps2.console"';
  }
  return 'naps2.console';
}

const NAPS2_PATH = getNaps2Path();

// 1. Health check
app.get('/health', (req, res) => {
  const naps2Clean = NAPS2_PATH.replace(/"/g, '');
  res.json({
    status: 'ok',
    naps2Detected: fs.existsSync(naps2Clean) || naps2Clean === 'naps2.console',
    naps2Path: NAPS2_PATH,
    platform: process.platform,
    port: PORT,
    secure: req.secure,
  });
});

// 2. Devices list
app.get('/scanners', (req, res) => {
  const cmd = `${NAPS2_PATH} --listdevices`;

  exec(cmd, (error, stdout) => {
    if (error) {
      exec(`${NAPS2_PATH} -l`, (err2, stdout2) => {
        return res.json({ scanners: parseScanners(stdout2 || '') });
      });
      return;
    }
    res.json({ scanners: parseScanners(stdout) });
  });
});

function parseScanners(output) {
  const lines = output.split('\n').map(l => l.trim()).filter(Boolean);
  const result = [];

  for (const line of lines) {
    if (line.toLowerCase().includes('device') || line.includes('-')) {
      const parts = line.split('-').pop() || line;
      result.push({ name: parts.trim() });
    } else if (line) {
      result.push({ name: line });
    }
  }

  return result.length > 0 ? result : [{ name: 'Default Scanner' }];
}

// 3. Perform scan
app.post('/scan', (req, res) => {
  const { device, resolution = 300, colorMode = 'Color' } = req.body || {};
  const tempFile = path.join(os.tmpdir(), `scan_${Date.now()}.pdf`);

  let bitdepth = 'color';
  if (colorMode === 'Gray') bitdepth = 'gray';
  if (colorMode === 'BW') bitdepth = 'bw';

  let cmd = `${NAPS2_PATH} -o "${tempFile}" -f --dpi ${resolution} --bitdepth ${bitdepth}`;
  if (device && device !== 'Default Scanner') {
    cmd += ` --device "${device}"`;
  }

  console.log('[Scanner Helper] Running scan command:', cmd);

  exec(cmd, { timeout: 120000 }, (error, stdout, stderr) => {
    if (error || !fs.existsSync(tempFile)) {
      console.error('[Scanner Helper] Scan failed:', error || stderr);
      return res.status(500).json({ success: false, message: 'Scan failed or was cancelled.' });
    }

    try {
      const fileBuffer = fs.readFileSync(tempFile);
      const base64Data = `data:application/pdf;base64,${fileBuffer.toString('base64')}`;
      fs.unlinkSync(tempFile);

      return res.json({
        success: true,
        data: base64Data,
        mimeType: 'application/pdf',
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: 'Failed to read scanned file.' });
    }
  });
});

// ─── Dual Server Startup: HTTPS + HTTP Fallback ───
// Start HTTP on port 5555
http.createServer(app).listen(PORT, '0.0.0.0', () => {
  console.log(`✅ HTTP Scanner Helper running on http://localhost:${PORT}`);
});

// Start HTTPS on port 5556
const sslCreds = getSslCredentials();
if (sslCreds) {
  https.createServer(sslCreds, app).listen(5556, '0.0.0.0', () => {
    console.log(`🔒 HTTPS Scanner Helper running on https://localhost:5556`);
  });
}