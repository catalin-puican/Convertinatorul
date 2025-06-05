import express from 'express';
import cors from 'cors';
import ffmpegPath from 'ffmpeg-static';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(cors());

const upload = multer({ dest: path.join(__dirname, 'uploads') });

app.post('/convert', upload.single('video'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('Fișierul video lipsește.');
  }

  const inputFilePath = req.file.path;
  const baseName = path.parse(req.file.originalname).name;
  const outputPath = path.join(__dirname, 'temp', `${baseName}-${randomUUID()}.mp3`);

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });

  const ffmpeg = spawn(ffmpegPath, [
    '-i', inputFilePath,
    '-f', 'mp3',
    '-ab', '192000',
    '-vn',
    outputPath,
  ]);

  ffmpeg.stderr.on('data', (data) => {
    console.error('ffmpeg stderr:', data.toString());
  });

  ffmpeg.on('error', (err) => {
    console.error('Eroare la pornirea ffmpeg:', err.message);
    res.status(500).send('Eroare la conversie.');
  });

  ffmpeg.on('close', (code) => {
    fs.unlink(inputFilePath, () => {}); // cleanup uploaded file

    if (code !== 0) {
      console.error(`ffmpeg s-a închis cu codul ${code}`);
      return res.status(500).send('Conversia a eșuat.');
    }

    res.download(outputPath, `${baseName}.mp3`, (err) => {
      if (err) {
        console.error('Eroare la trimiterea fișierului:', err.message);
      }

      fs.unlink(outputPath, () => {}); // cleanup output file
    });
  });
});

app.listen(PORT, () => {
  console.log(`Serverul rulează pe http://localhost:${PORT}`);
});
