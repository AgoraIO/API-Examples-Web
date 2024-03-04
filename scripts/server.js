const express = require("express")
const path = require("path")

// change the port if necessary
const PORT = 3001
const URL = `http://localhost:${PORT}/index.html`

const dir = path.join(__dirname, "../src")
const app = express()
app.use(express.static(dir))

app.listen(PORT, () => {
  console.info(`\n---------------------------------------\n`)
  console.info(`please visit: ${URL}`)
  console.info(`\n---------------------------------------\n`)
})
