const express = require('express');
const cors = require('cors');
const app = express();
app.use(express.json()); // Add this line to parse JSON request bodies
const port = 8000;

// enable CORS for requests coming from localhost:3000
app.use(cors({
  origin: 'http://localhost:3000'
}));

const router = require('./dialogFlowV1');

app.use(router);

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });