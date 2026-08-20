import express from 'express';
import cors from 'cors';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';

const app = express();
const PORT = 5555;

app.use(cors());
app.use(express.json());

// Auto-detect NAPS2 path on macOS and Windows
function getNaps2Path() {
  const isWin = process.platform === 'win32';
  const isMac = process.platform === 'darwin';

  if (isWin) {
    if (fs.existsSync('C:\\Program Files\\NAPS2\\naps2.console.exe')) {
      return '"C:\\Program Files\\NAPS2\\naps2.console.exe"';
    }
    if (fs.existsSync('C:\\Program Files (x86)\\NAPS2\\naps2.console.exe')) {
      return '"C:\\Program Files (x86)\\NAPS2\\naps2.console.exe"';
    }
  }

  if (isMac) {
    if (fs.existsSync('/Applications/NAPS2.app/Contents/MacOS/naps2.console')) {
      return '"/Applications/NAPS2.app/Contents/MacOS/naps2.console"';
    }
  }

  return 'naps2.console';
}

const NAPS2_PATH = getNaps2Path();

// 1. Health check (Vue pings this)
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// 2. Get list of scanners connected to machine
app.get('/scanners', (req, res) => {
  const cmd = `${NAPS2_PATH} --listdevices`;
  exec(cmd, (error, stdout) => {
    if (error) {
      exec(`${NAPS2_PATH} -l`, (err2, stdout2) => {
        const scanners = parseScanners(stdout2 || '');
        return res.json({ scanners });
      });
      return;
    }
    const scanners = parseScanners(stdout);
    res.json({ scanners });
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

// 3. Perform scan and return base64 PDF to Vue
app.post('/scan', (req, res) => {
  const { device, resolution = 300, colorMode = 'Color' } = req.body;
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

      // Clean up temp file
      fs.unlinkSync(tempFile);

      console.log('[Scanner Helper] Scan complete, sending PDF...');
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

app.listen(PORT, () => {
  console.log(`✅ NAPS2 Scanner Helper running on http://localhost:${PORT}`);
});