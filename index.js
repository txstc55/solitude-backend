const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const app = express();


// Middleware
app.use(bodyParser.json());
app.use(cors());

global.chatBoxTexts = require('./api/models/chatBoxTexts');
global.confessions = require('./api/models/confessions');

const chatBoxTextsRoutes = require('./api/routes/chatBoxTextsRoutes');
const confessionsRoutes = require('./api/routes/confessionsRoutes');

mongoose.Promise = global.Promise;
// mongoose.set('useFindAndModify', false);
mongoose.connect(
    'mongodb://localhost/solitude',
    { useNewUrlParser: true, useUnifiedTopology: true }
);



const port = process.env.PORT || 5003;

chatBoxTextsRoutes(app);
confessionsRoutes(app);

app.use((req, res) => {
    res.status(404).send({ url: `${req.originalUrl} not found` });
});

app.listen(port, () => console.log(`Server started on port ${port}`));