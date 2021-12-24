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

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})