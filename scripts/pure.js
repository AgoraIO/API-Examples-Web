// TIP: This script is used to purge all SSO-related code from the project.
// This file does not require attention.

const { readdirSync, existsSync, readFileSync, writeFileSync, statSync } = require('fs')
const path = require("path")
const { exec } = require('child_process')

const TARGET_DIR = path.resolve(__dirname, '../src');
const REG_SSO_SCRIPT = /^\s+\<script src="\S*sso\/index\.js"\>\<\/script\>\n+/gm
const REG_SSO_CODE = /^\s+\/\/\s+agora content inspect start[\S\s]+?agora content inspect end\s*\n/gm

function isDirectorySync(p) {
  try {
    const stats = statSync(p);
    return stats.isDirectory();
  } catch (err) {
    console.error(err);
  }
}



// scan files and remove sso folder
const delSSORelatedFile = () => {
  console.log('----- delSSORelatedFile -----')
  const ssoDir = path.join(TARGET_DIR, 'sso');
  console.log(ssoDir)
  if (existsSync(ssoDir)) {
    exec(`rm -rf ${ssoDir}`, (err, stdout, stderr) => {
      if (err) {
        console.log(err)
      }
    })
  }
}


// scan html files and remove sso script 
const delSSORelatedHTMLCode = () => {
  console.log('----- delSSORelatedHTMLCode -----')

  const delChildrenSSORelatedHTMLCode = (targetDir) => {
    const indexHtmlPath = path.resolve(targetDir, 'index.html');
    if (existsSync(indexHtmlPath)) {
      removeSSOScriptTag(indexHtmlPath);
    }
    const dirs = readdirSync(targetDir);
    dirs.forEach(dir => {
      let innerDir = path.resolve(targetDir, dir);
      if (isDirectorySync(innerDir)) {
        delChildrenSSORelatedHTMLCode(innerDir)
      }
    })
  }

  console.log('*********** removeSSOScriptTag ***********')
  delChildrenSSORelatedHTMLCode(TARGET_DIR);
}

// scan js files and remove sso code
const delSSORelatedJSCode = () => {
  console.log('----- delSSORelatedJSCode -----')

  const delChildrenSSORelatedJSCode = (targetDir) => {
    const indexJSPath = path.resolve(targetDir, 'index.js');
    if (existsSync(indexJSPath)) {
      removeSSOCode(indexJSPath);
    }
    const dirs = readdirSync(targetDir);
    dirs.forEach(dir => {
      let innerDir = path.resolve(targetDir, dir);
      if (isDirectorySync(innerDir)) {
        delChildrenSSORelatedJSCode(innerDir)
      }
    })
  }

  console.log('*********** removeSSOScriptTag ***********')
  delChildrenSSORelatedJSCode(TARGET_DIR);

}

// remove <script src="sso/index.js"></script> from html file
const removeSSOScriptTag = (htmlPath) => {
  console.log(htmlPath)
  let htmlContent = readFileSync(htmlPath, 'utf-8');
  htmlContent = htmlContent.replace(REG_SSO_SCRIPT, '');
  writeFileSync(htmlPath, htmlContent);
}

const removeSSOCode = (jsPath) => {
  console.log(jsPath)
  let jsContent = readFileSync(jsPath, 'utf-8');
  jsContent = jsContent.replace(REG_SSO_CODE, '');
  writeFileSync(jsPath, jsContent);
}

function run() {
  console.log('----- pure run start -----')
  delSSORelatedFile();
  delSSORelatedHTMLCode();
  delSSORelatedJSCode();
  console.log('----- pure run end -----')
}


run()
