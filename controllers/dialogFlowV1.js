const express = require('express');
const fs = require("fs");
const util = require('util');
require('dotenv').config();
const router = express.Router();

const multer = require('multer');
const upload = multer();

const projectId = 'coastal-volt-375306';
const location = 'us-central1';
const agentId = '835ef5b6-3b2f-47b5-8f77-ed19404d70ab';
let query = ''; 
const languageCode = 'en-US';
// const encoding = 'AUDIO_ENCODING_LINEAR_16';
const sampleRateHertz = 48000;

// Configuration of how speech should be synthesized. See https://cloud.google.com/dialogflow/cx/docs/reference/rest/v3/OutputAudioConfig#SynthesizeSpeechConfig
const synthesizeSpeechConfig = {
  speakingRate: 1.25,
  pitch: 10.0,
};

// Imports the Google Cloud Some API library
const {SessionsClient} = require('@google-cloud/dialogflow-cx');
const client = new SessionsClient({apiEndpoint: 'us-central1-dialogflow.googleapis.com'})

router.post('/getDialogFlowResponse', async(req, res) => {

  if (!req.body || !req.body.query) {
    return res.status(400).send('Invalid request: missing query parameter');
  }

  let sessionId = req.query.sessionId;

  if (!sessionId) {
    sessionId = Math.random().toString(36).substring(7);
  }

  console.log("Printing session id here : ", sessionId);
  const sessionPath = client.projectLocationAgentSessionPath(
    projectId,
    location,
    agentId,
    sessionId
  );

  query = req.body.query;
  console.log("Here is the query value : ", query);

  let agentResponse;
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

  console.log("Here is the raw response : ", response)
  for (const message of response.queryResult.responseMessages) {
    if (message.text) {
      console.log(`Agent Response: ${message.text}`);
      agentResponse = message.text;
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

  return res.status(200).send({
    'sessionId' : sessionId,
    'Agent Response' : agentResponse,
  });

})

router.post('/getDialogFlowResponseWithAudioInput', upload.single('audio'),async(req, res) => {

  let sessionId = req.query.sessionId;

  if (!sessionId) {
    sessionId = Math.random().toString(36).substring(7);
  }

  // retrieve the audio blob from the request body
  const audioBlob = req.file.buffer;
  console.log("Audio Data : ", req.file.buffer)

  sessionId = Math.random().toString(36).substring(7);
  const sessionPath = client.projectLocationAgentSessionPath(
    projectId,
    location,
    agentId,
    sessionId
  );
  console.info(sessionPath);

  // Read the content of the audio file and send it as part of the request.
  // const readFile = util.promisify(fs.readFile);
  // const inputAudio = await readFile(audioFileName);
  let agentResponse
  const request = {
    session: sessionPath,
    queryInput: {
      audio: {
        config: {
          // audioEncoding: encoding,
          sampleRateHertz: sampleRateHertz,
        },
        audio: audioBlob,
      },
      languageCode,
    },
  };
  const [response] = await client.detectIntent(request);
  console.log(`User Query: ${response.queryResult.transcript}`);
  for (const message of response.queryResult.responseMessages) {
    if (message.text) {
      console.log(`Agent Response: ${message.text.text}`);
      agentResponse = message.text.text;
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

  return res.status(200).send({
    'sessionId' : sessionId,
    'agentResponse' : agentResponse,
  });

})

router.post('/getDialogFlowResponseWithAudioOutput', upload.single('audio'),async(req, res) => {

  let sessionId = req.query.sessionId;

  if (!sessionId) {
    sessionId = Math.random().toString(36).substring(7);
  }

  // retrieve the audio blob from the request body
  const audioBlob = req.file.buffer;
  console.log("Audio Data : ", req.file.buffer)

  sessionId = Math.random().toString(36).substring(7);
  const sessionPath = client.projectLocationAgentSessionPath(
    projectId,
    location,
    agentId,
    sessionId
  );
  console.info(sessionPath);

   // Constructs the audio query request
   const request = {
    session: sessionPath,
    queryInput: {
      audio: {
        config: {
          // audioEncoding: encoding,
          sampleRateHertz: sampleRateHertz,
        },
        audio: audioBlob,
      },
      languageCode,
    },
    outputAudioConfig: {
      audioEncoding: 'OUTPUT_AUDIO_ENCODING_LINEAR_16',
      synthesizeSpeechConfig: synthesizeSpeechConfig,
    },
  };

  const [response] = await client.detectIntent(request);

  for (const message of response.queryResult.responseMessages) {
    if (message.text) {
      console.log(`Agent Response: ${message.text.text}`);
      agentResponse = message.text.text;
    }
  }

  // Output audio configurations
  console.log(
    `Speaking Rate: ${response.outputAudioConfig.synthesizeSpeechConfig.speakingRate}`
  );
  console.log(
    `Pitch: ${response.outputAudioConfig.synthesizeSpeechConfig.pitch}`
  );

  // const audioFile = response.outputAudio;
  // // console.log("Whole response : ", response)
  // console.log("Audio response : ", response.outputAudio);

  // let outputFile = "output.wav"

  // // Writes audio content to output file
  // util.promisify(fs.writeFile)(outputFile, audioFile, 'binary');
  // console.log(`Audio content written to file: ${outputFile}`);

  return res.status(200).send({
    'sessionId' : sessionId,
    'agentResponse' : agentResponse,
    'audioResponse' : response.outputAudio
  }); 

})

module.exports = router;

