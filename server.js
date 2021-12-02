const express = require('express')
const app = express()
const port = 3000

app.use(express.static('dist', { setHeaders: function(res, path) {
    res.set("Cross-Origin-Opener-Policy", "same-origin");
    res.set("Cross-Origin-Embedder-Policy", "require-corp");
}}));

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
});
