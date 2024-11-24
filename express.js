import fs from 'fs';
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';

const app = express();

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.get('/', (req, res) => {
    res.send('Welcome Back Server Lennon');
});

// MESSAGES
app.get('/messages', (req, res) => {
    fs.readFile('./db/messages.json', 'utf8', (err, messages) => {
        if (err) {
            res.status(500).send('Messages error: ' + err);
        }
        else{
            res.send(messages);
        }
    });
});

app.post('/messages', (req, res) => {
    fs.readFile('./db/messages.json', 'utf8', (err, data) => {
        if (err) {
            res.status(500).send('Messages error: ' + err);
            return;
        }

        let messages = [];
        messages = JSON.parse(data);
        const newMessage = req.body;
        messages.push(newMessage);

        fs.writeFile('./db/messages.json', JSON.stringify(messages, null, 2), (err) => {
            if (err) {
                res.status(500).send('Add error: ' + err);
                return;
            }

            res.status(201).send('Message added');
        });
    });
});

app.listen(1981, () => console.log("John Lennon running on port: http://localhost:1981"));