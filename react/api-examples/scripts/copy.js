import { fileURLToPath } from 'url';
import path from 'path'
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const EXTERNAL_PATH = path.resolve(__dirname, '../public/external');
const items = [
  {
    source: path.resolve(__dirname, '../node_modules/agora-extension-ai-denoiser/external'),
    dest: path.resolve(__dirname, '../public/external/agora-extension-ai-denoiser')
  },
  {
    source: path.resolve(__dirname, '../node_modules/agora-extension-spatial-audio/external'),
    dest: path.resolve(__dirname, '../public/external/agora-extension-spatial-audio')
  },
  {
    source: path.resolve(__dirname, '../node_modules/agora-extension-virtual-background/wasms'),
    dest: path.resolve(__dirname, '../public/external/agora-extension-virtual-background')
  }
]



function copyDir(sourceFolder, destinationFolder) {
  if (!fs.existsSync(destinationFolder)) {
    fs.mkdirSync(destinationFolder);
  }
  const files = fs.readdirSync(sourceFolder);
  files.forEach(file => {
    const sourcePath = path.join(sourceFolder, file);
    const destinationPath = path.join(destinationFolder, file);
    if (fs.statSync(sourcePath).isDirectory()) {
      fs.mkdirSync(destinationPath);
      copyFolderRecursive(sourcePath, destinationPath);
    } else {
      fs.copyFileSync(sourcePath, destinationPath);
    }
  });
}

function createExternalDirectory(path) {
  return new Promise((resolve, reject) => {
    fs.mkdir(path, { recursive: true }, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  })
}

async function copyWasmFiles() {
  console.log('*************** copy wasm files ***************')
  await createExternalDirectory(EXTERNAL_PATH)
  items.forEach(({ source, dest }) => {
    copyDir(source, dest)
  })
}


function run() {
  copyWasmFiles()
}


run()
