// for delete sso related code just for github
const { readdirSync, existsSync, readFileSync, writeFileSync, statSync } = require('fs')
const path = require("path")
const { exec } = require('child_process')
const { parse } = require("@babel/parser");
const generate = require("@babel/generator").default
const traverse = require("@babel/traverse").default
const t = require("@babel/types")

const TARGET_DIR = path.resolve(__dirname, '../react/api-examples');
const SRC_DIR = path.resolve(TARGET_DIR, './src');
const REG_SSO_UTIL_PATH = /utils\/sso$/
const REG_JSX_PATH = /\.jsx$/

// scan files
// del utils/sso.js
async function delSSORelatedFile() {
  console.log('delSSORelatedFile ***********************************************');
  const ssoJsPath = path.resolve(TARGET_DIR, './src/utils/sso.js');
  if (existsSync(ssoJsPath)) {
    exec(`rm -rf ${ssoJsPath}`);
  }
}


async function delPackageJsonSSOInfo() {
  console.log('delPackageJsonSSOInfo ***********************************************');
  const jsonPath = path.resolve(TARGET_DIR, './package.json');
  const res = readFileSync(jsonPath, 'utf-8');
  const obj = JSON.parse(res, {

  });
  const devCmd = obj.scripts.dev;
  obj.scripts = {
    dev: devCmd
  }
  writeFileSync(jsonPath, JSON.stringify(obj, null, 2));
}


// del  /** SSO */
// del import from "utils/sso"
// del if (isSSOMode()){}
// del component with isSSOMode
async function delSSORelatedCode() {
  console.log('delSSORelatedJSCode ***********************************************');
  const files = _getAllFiles(SRC_DIR)
  files.forEach(p => {
    ASTDelSSOCode(p)
  })
}



function ASTDelSSOCode(p) {
  let code = readFileSync(p, 'utf-8');
  const ast = parse(code, {
    sourceType: "module",
    plugins: [
      "jsx",
    ],
  });
  // traverse ast
  traverse(ast, {
    IfStatement(path) {
      const node = path.node
      const test = node.test
      // in if
      // const consequent = node.consequent || {}
      // in else 
      // const alternate = node.alternate || {}
      if (t.isCallExpression(test)) {
        const callee = test.callee
        if (callee.name == 'isSSOMode') {
          path.remove()
        }
      }
    },
    JSXExpressionContainer(path) {
      const node = path.node
      const expression = node.expression
      const alternate = expression.alternate
      const consequent = expression.consequent
      const test = expression.test
      if (t.isConditionalExpression(expression)) {
        if (t.isCallExpression(test)) {
          const callee = test.callee
          if (callee.name == 'isSSOMode') {
            path.replaceWithMultiple(alternate)
          }
        }
      }
    },
    ImportDeclaration(path) {
      const node = path.node
      const { source = {} } = node
      const { value = "" } = source
      if (REG_SSO_UTIL_PATH.test(value)) {
        path.remove()
      }
    }
  });
  // generate code
  const output = generate(
    ast,
    {
      compact: false,
      // retainLines: true,
    },
    code
  );
  writeFileSync(p, output.code);
}


function run() {
  delSSORelatedFile();
  delPackageJsonSSOInfo()
  delSSORelatedCode();
}


function _getAllFiles(dirPath, arrayOfFiles = []) {
  files = readdirSync(dirPath)
  files.forEach(file => {
    if (statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = _getAllFiles(dirPath + "/" + file, arrayOfFiles)
    } else {
      if (REG_JSX_PATH.test(file)) {
        arrayOfFiles.push(path.join(dirPath, "/", file))
      }
    }
  })
  return arrayOfFiles
}



run()


