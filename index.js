const express = require('express')
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const cors = require('cors');
const app = express()
require('dotenv').config();

console.log(process.env.DB_USER);
const port = process.env.PORT ||  5000;

app.use(cors())
app.use(bodyParser.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.2xoju.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
console.log(uri);

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const appointmentCollection = client.db("doctorsPortal").collection("appointment");
  
  app.post('/addAppointment', (req, res)=>{
    const appointment = req.body
    appointmentCollection.insertOne(appointment)
    .then(result=>{
      res.send(result.insertedCount>0)
    })
  })

  app.get('/appointments', (req, res) => {
    appointmentCollection.find({})
        .toArray((err, documents) => {
            res.send(documents);
        })
})

  
  app.post('/appointmentById', (req, res)=>{
    const date = req.body
    appointmentCollection.find({date:date.date})
    .toArray((err, documents) => {
      res.send(documents)
    })
  })

  
});


app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})