const express = require('express');
const fs = require('fs/promises');
const bodyParser = require('body-parser');
const cors = require('cors');

const {
    MongoClient,
    ObjectId
} = require('mongodb');

require('dotenv').config();


const client = new MongoClient(process.env.FINAL_URL);

const app = express();
const port = process.env.PORT;


const corsOptions = { origin:'*', credentials: true }
//app.use(cors);
app.use(cors(corsOptions));

app.use(express.static('public'));
app.use(bodyParser.json());


app.get('/getRecipes', async (req, res) => {
    try {
        await client.connect();
        const colli = client.db('webDatabase').collection('userData');
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

//recipe by id /recipe?id=
app.get('/recipe', async (req, res) => {
    try {
        await client.connect();
        const colli = client.db('webDatabase').collection('userData');
        const query = {
            rid: req.query.id
        };

        const recipe = await colli.findOne(query);

        if (recipe) {
            res.status(200).send(recipe);
            return;
        } else {
            res.status(400).send('Recipe with id:'+ req.query.id +' could not be found.' );
        }
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

app.delete('/deleteRecipe', async (req, res) => {
    try {
        await client.connect();
        const colli = client.db("webDatabase").collection("userData");

        const query = {
            rid: req.query.id
        };

        const result = await colli.deleteOne(query);
        if (result.deletedCount === 1) {
            res.status(200).send(`Recipe with id "${req.query.id}" successfully deleted.`);
        } else {
            res.status(404).send("No recipe matched with the query.");
        }
    } catch (error) {
        console.log(error);
        res.status(500).send({
            error: "something went wrong",
            value: error,
        });
    } finally {
        await client.close();
    }
});

app.post('/saveRecipe', async (req, res) => {

    if (!req.body.rid || !req.body.title || !req.body.aggregateLikes || !req.body.readyInMinutes || !req.body.diets) {
        res.status(400).send('Bad request: missing id, title, aggregateLikes, readyInMinutes,  diets');
        return;
    }

    try {
        //connect to the db
        await client.connect();

        //retrieve the recipe collection data
        const colli = client.db('webDatabase').collection('userData');

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
        res.status(201).send(`Reecipe succesfully saved with id ${req.body.rid}`);
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

app.put('/changeRecipe', async (req, res) => {
    if (!req.body.rid || !req.body.title || !req.body.aggregateLikes || !req.body.readyInMinutes || !req.body.diets) {
        res.status(400).send('Bad request: missing id, title, aggregateLikes, readyInMinutes,  diets');
        return;
    }
    try {
        await client.connect();
        const colli = client.db('webDatabase').collection('userData');
        const data = await colli.findOne({
            rid: req.body.rid
        });
        let result = await colli.updateOne({
            rid: req.body.rid,
            title: req.body.title,
            aggregateLikes: req.body.aggregateLikes,
            readyInMinutes: req.body.readyInMinutes,
            diets: req.body.diets
        })
    } finally {
        await client.close();
    }
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})