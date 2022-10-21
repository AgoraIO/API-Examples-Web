
const { readdirSync, existsSync, readFileSync, writeFileSync, statSync } = require('fs')
const path = require("path")
const { exec } = require('child_process')
const { exit } = require("process")
const { parse } = require("@babel/parser");
const generate = require("@babel/generator").default
const traverse = require("@babel/traverse").default
const t = require("@babel/types")

const TARGET_DIR = path.resolve(__dirname, '../Demo');
const REG_SSO_SCRIPT = /\<script src="\S*js\/sso\.js"\>\<\/script\>/gm
const REG_JS_SUFFIX = /\.js$/;
const REG_ESM_SUFFIX = /\.esm\.js$/
const REG_MIN_SUFFIX = /\.min\.js$/
const EXCLUDES_DIR_NAME = ['assets', "hotPlug", "js", "i18n", "spatialAudioExtention"]

// scan files
// del js/sso
// del sso/*
async function delSSORelatedFile() {
  console.log('delSSORelatedFile ***********************************************');
  const ssoJs = path.join(TARGET_DIR, 'js/sso.js');
  const ssoDir = path.join(TARGET_DIR, 'sso');
  if (existsSync(ssoJs)) {
    exec(`rm -rf ${ssoJs}`);
  }
  if (existsSync(ssoDir)) {
    exec(`rm -rf ${ssoDir}`);
  }
}

// scan html files
// del <script src="../js/sso.js"></script> 
async function delSSORelatedHTMLCode() {
  console.log('delSSORelatedHTMLCode ***********************************************');
  const rootIndexHtml = path.join(TARGET_DIR, './index.html');
  if (existsSync(rootIndexHtml)) {
    removeSSOScript(rootIndexHtml)
  }
  const dirs = readdirSync(TARGET_DIR);
  dirs.forEach(dir => {
    const indexHtml = path.join(TARGET_DIR, dir, './index.html');
    if (existsSync(indexHtml)) {
      removeSSOScript(indexHtml);
    }
  })
}

// if (openSSO) {
//  A...
// } else {
//  B...
// }
// to
// B...
async function delSSORelatedJSCode() {
  console.log('delSSORelatedJSCode ***********************************************');
  const dirs = readdirSync(TARGET_DIR);
  dirs.forEach(dir => {
    if (!EXCLUDES_DIR_NAME.includes(dir)) {
      const curDir = path.join(TARGET_DIR, dir)
      const stats = statSync(curDir);
      if (stats.isDirectory()) {
        const names = readdirSync(curDir);
        names.forEach(name => {
          if (REG_JS_SUFFIX.test(name) && !REG_ESM_SUFFIX.test(name) && !REG_MIN_SUFFIX.test(name)) {
            const finJsPath = path.join(curDir, name);
            ASTDelSSOCode(finJsPath)
          }
        })
      }
    }
  })
}




function removeSSOScript(htmlPath) {
  let html = readFileSync(htmlPath, 'utf-8');
  html = html.replace(REG_SSO_SCRIPT, '');
  writeFileSync(htmlPath, html);
}

function ASTDelSSOCode(p) {
  let code = readFileSync(p, 'utf-8');
  const ast = parse(code);
  traverse(ast, {
    IfStatement(path) {
      const node = path.node
      const test = node.test
      // in if
      const consequent = node.consequent || {}
      // in else 
      const alternate = node.alternate || {}
      if (t.isIdentifier(test)) {
        if (test.name == "openSSO" || test.name == 'window.openSSO') {
          if (alternate.body && alternate.body.length > 0) {
            path.replaceWithMultiple(alternate.body)
          } else {
            path.remove()
          }
        }
      }
    }
  });
  const output = generate(
    ast,
    {
      // ...options
    },
    code
  );
  writeFileSync(p, output.code);
}


function run() {
  delSSORelatedFile();
  delSSORelatedHTMLCode();
  delSSORelatedJSCode();
}


run()


