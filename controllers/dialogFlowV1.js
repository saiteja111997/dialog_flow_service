const express = require('express');
const fs = require("fs");
require('dotenv').config();
const router = express.Router();

const projectId = 'coastal-volt-375306';
const location = 'us-central1';
const agentId = '835ef5b6-3b2f-47b5-8f77-ed19404d70ab';
const query = 'Hello Tron';
const languageCode = 'en';

// Imports the Google Cloud Some API library
const {SessionsClient} = require('@google-cloud/dialogflow-cx');
const client = new SessionsClient({apiEndpoint: 'us-central1-dialogflow.googleapis.com'})

router.post('/getDialogFlowResponse', async(req, res) => {
  const sessionId = Math.random().toString(36).substring(7);
  const sessionPath = client.projectLocationAgentSessionPath(
    projectId,
    location,
    agentId,
    sessionId
  );
  const request = {
    session: sessionPath,
    queryInput: {
      text: {
        text: query,
      },
      languageCode,
    },
  };
  const [response] = await client.detectIntent(request);
  for (const message of response.queryResult.responseMessages) {
    if (message.text) {
      console.log(`Agent Response: ${message.text.text}`);
    }
  }
  if (response.queryResult.match.intent) {
    console.log(
      `Matched Intent: ${response.queryResult.match.intent.displayName}`
    );
  }
  console.log(
    `Current Page: ${response.queryResult.currentPage.displayName}`
  );
})

// async function detectIntentText() {
        
// }
      
//  detectIntentText();

module.exports = router;

