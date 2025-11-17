const express = require('express');
const twilio = require('twilio');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

app.post('/sms', (req, res) => {
    const twiml = new twilio.twiml.MessagingResponse();
    twiml.message('hello world');
    res.type('text/xml').send(twiml.toString());
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Twilio SMS webhook listening on port ${PORT}`);
});
