const express = require("express")
const path = require("path")
const port = 3000

const dir = path.join(__dirname, "../Demo")
const app = express()
app.use(express.static(dir))

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
