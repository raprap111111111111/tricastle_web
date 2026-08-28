const express = require('express');
const cors = require('cors');
const { exec, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const app = express();
const PORT = 5555;

process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err.message);
});

app.use(cors({ origin: '*', methods: ['GET', 'POST', 'OPTIONS'] }));
app.use(express.json());

// ─── Auto-install to Windows Startup ───
function ensureWindowsStartup() {
  if (process.platform !== 'win32') return;

  try {
    const startupFolder = path.join(
      os.homedir(),
      'AppData', 'Roaming', 'Microsoft', 'Windows', 'Start Menu', 'Programs', 'Startup'
    );
    const exePath = process.execPath;
    const shortcutPath = path.join(startupFolder, 'TricastleScannerHelper.lnk');
    const vbsScript = path.join(os.tmpdir(), 'tricastle_create_shortcut.vbs');

    if (!fs.existsSync(shortcutPath) && exePath.toLowerCase().endsWith('.exe')) {
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
  } catch (err) {
    console.error('[Auto-Installer Warning]', err?.message || err);
  }
}

ensureWindowsStartup();

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
  });
});

// 2. Fetch list of USB devices + LAN / Wi-Fi profiles
app.get('/scanners', (req, res) => {
  exec(`${NAPS2_PATH} --listprofiles`, (errProfiles, stdoutProfiles) => {
    let profiles = parseItems(stdoutProfiles || '');

    exec(`${NAPS2_PATH} --listdevices`, (errDevices, stdoutDevices) => {
      let devices = parseItems(stdoutDevices || '');
      
      const allScanners = [];
      
      // Auto-detect list: USB devices + Wi-Fi Profiles
      devices.forEach(d => allScanners.push({ name: `🔌 USB: ${d}`, isProfile: false, raw: d }));
      profiles.forEach(p => allScanners.push({ name: `📶 Wi-Fi/LAN: ${p}`, isProfile: true, raw: p }));

      if (allScanners.length === 0) {
        allScanners.push({ name: '⚡ Auto-Detect (USB or Wi-Fi)', isProfile: false, raw: 'default' });
      }

      res.json({ scanners: allScanners });
    });
  });
});

function parseItems(output) {
  return output
    .split('\n')
    .map(l => l.trim())
    .filter(Boolean)
    .map(line => {
      if (line.includes('-')) return line.split('-').pop().trim();
      return line;
    });
}

// 3. Smart Scan Execution (USB with Auto-Fallback to Wi-Fi/LAN)
app.post('/scan', (req, res) => {
  const { device, resolution = 300, colorMode = 'Color' } = req.body || {};
  const tempFile = path.join(os.tmpdir(), `scan_${Date.now()}.pdf`);

  let bitdepth = 'color';
  if (colorMode === 'Gray') bitdepth = 'gray';
  if (colorMode === 'BW') bitdepth = 'bw';

  // Clean raw device / profile name
  let cleanDevice = device ? device.replace('🔌 USB: ', '').replace('📶 Wi-Fi/LAN: ', '').trim() : '';

  // Attempt 1: Primary Scan Command
  let cmd = `${NAPS2_PATH} -o "${tempFile}" -f --dpi ${resolution} --bitdepth ${bitdepth}`;
  if (device && device.includes('Wi-Fi/LAN:')) {
    cmd += ` --profile "${cleanDevice}"`;
  } else if (cleanDevice && !cleanDevice.includes('Auto-Detect') && cleanDevice !== 'Default Scanner') {
    cmd += ` --device "${cleanDevice}"`;
  }

  console.log('🚀 [Scanner Helper] Attempting primary scan:', cmd);

  // Execute Attempt 1 (15-second timeout for quick fallback if USB is disconnected)
  exec(cmd, { timeout: 15000 }, (error, stdout, stderr) => {
    
    // IF USB FAILED OR NOT PLUGGED IN -> ATTEMPT 2: Wi-Fi / LAN Fallback!
    if (error || !fs.existsSync(tempFile)) {
      console.warn('⚠️ [Scanner Helper] USB scan unavailable. Switching to Wi-Fi / LAN Auto-Fallback...');

      // Fallback 1: Try network eSCL driver
      let lanCmd = `${NAPS2_PATH} -o "${tempFile}" -f --driver escl --dpi ${resolution} --bitdepth ${bitdepth}`;

      exec(lanCmd, { timeout: 30000 }, (errLan, stdoutLan) => {
        if (!errLan && fs.existsSync(tempFile)) {
          return sendPdfResponse(res, tempFile);
        }

        // Fallback 2: Try NAPS2 default saved network profile
        let profileCmd = `${NAPS2_PATH} -o "${tempFile}" -f --dpi ${resolution} --bitdepth ${bitdepth}`;

        exec(profileCmd, { timeout: 30000 }, (errProfile) => {
          if (!errProfile && fs.existsSync(tempFile)) {
            return sendPdfResponse(res, tempFile);
          }

          console.error('❌ [Scanner Helper] All USB and Wi-Fi scan attempts failed.');
          return res.status(500).json({
            success: false,
            message: 'No scanner found. Please plug in USB or connect to Wi-Fi network.',
          });
        });
      });
      return;
    }

    return sendPdfResponse(res, tempFile);
  });
});

function sendPdfResponse(res, filePath) {
  try {
    const fileBuffer = fs.readFileSync(filePath);
    const base64Data = `data:application/pdf;base64,${fileBuffer.toString('base64')}`;
    fs.unlinkSync(filePath);

    console.log('✅ [Scanner Helper] Scan complete! Sending PDF to web app...');
    return res.json({
      success: true,
      data: base64Data,
      mimeType: 'application/pdf',
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to read scanned file.' });
  }
}

app.listen(PORT, '0.0.0.0', () => {
  console.log('====================================================');
  console.log(`✅ Tricastle Smart USB + Wi-Fi Scanner Helper on ${PORT}`);
  console.log('====================================================');
});