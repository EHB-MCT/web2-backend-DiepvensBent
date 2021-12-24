const express = require('express');
const fs = require('fs/promises');
const bodyParser = require('body-parser');
const {
    MongoClient
} = require('mongodb');

require('dotenv').config();


const client = new MongoClient(process.env.FINAL_URL);

const app = express();
const port = process.env.PORT;

app.use(express.static('public'));
app.use(bodyParser.json());


app.get('/cheese', async (req, res) => {
    try{
        await client.connect();
        const colli = client.db('courseProject').collection('userData');
        const data = await colli.find({}).toArray();

        res.status(200).send(JSON.parse(data));
    }catch(error){
        console.log(error);
        res.status(500).send({
           error: 'Something went wrong',
           value: error
        });
    }finally{
        await client.close();
    }
});


app.post('/saveData', (req, res) => {
    console.log(req.body);

    res.send(`Data received, hello ${req.body.name}`)
});
app.get('/test', (req, res) => {
    let data = {
        name: "Bent",
        lastname: "Diepvens"
    }
    res.send(data);
})

app.post('/saveBoardgame', async (req, res) => {

    if(!req.body.bggid || !req.body.name || !req.body.genre || !req.body.mechanisms
        || !req.body.description){
        res.status(400).send('Bad request: missing id, name, genre, mechanisms or description');
        return;
    }

    try{
        //connect to the db
        await client.connect();

        //retrieve the boardgame collection data
        const colli = client.db('courseProject').collection('userData');

        // Validation for double boardgames
        const bg = await colli.findOne({bggid: req.body.bggid});
        if(bg){
            res.status(400).send('Bad request: boardgame already exists with bggid ' + req.body.bggid);
            return;
        } 
        // Create the new boardgame object
        let newBoardgame = {
            bggid: req.body.bggid,
            name: req.body.name,
            genre: req.body.genre,
            mechanisms: req.body.mechanisms,
            description: req.body.description
        }
        
        // Insert into the database
        let insertResult = await colli.insertOne(newBoardgame);

        //Send back successmessage
        res.status(201).send(`Boardgame succesfully saved with id ${req.body.bggid}`);
        return;
    }catch(error){
        console.log(error);
        res.status(500).send({
            error: 'Something went wrong',
            value: error
        });
    }finally {
        await client.close();
    }
});



app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})