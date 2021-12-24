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


app.get('/getRecipes', async (req, res) => {
    try {
        await client.connect();
        const colli = client.db('courseProject').collection('userData');
        const data = await colli.find({}).toArray();

        res.status(200).send(data);
    } catch (error) {
        console.log(error);
        res.status(500).send({
            error: 'Something went wrong',
            value: error
        });
    } finally {
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

app.post('/saveRecipe', async (req, res) => {

    if (!req.body.rid || !req.body.title || !req.body.aggregateLikes || !req.body.readyInMinutes || !req.body.diets) {
        res.status(400).send('Bad request: missing id, title, aggregateLikes, readyInMinutes,  diets');
        return;
    }

    try {
        //connect to the db
        await client.connect();

        //retrieve the recipe collection data
        const colli = client.db('courseProject').collection('userData');

        // Validation for double recipes
        const data = await colli.findOne({
            rid: req.body.rid
        });
        if (data) {
            res.status(400).send('Bad request: recipe already exists with rid ' + req.body.rid);
            return;
        }
        // Create the new recipe object
        let newRecipe = {
            rid: req.body.rid,
            title: req.body.title,
            aggregateLikes: req.body.aggregateLikes,
            readyInMinutes: req.body.readyInMinutes,
            diets: req.body.diets
        }

        // Insert into the database
        let insertResult = await colli.insertOne(newRecipe);

        //Send back successmessage
        res.status(201).send(`Boardgame succesfully saved with id ${req.body.rid}`);
        return;
    } catch (error) {
        console.log(error);
        res.status(500).send({
            error: 'Something went wrong',
            value: error
        });
    } finally {
        await client.close();
    }
});



app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})