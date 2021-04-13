const express = require('express')
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const fileUpload = require('express-fileupload');
const cors = require('cors');
const app = express()
require('dotenv').config();

console.log(process.env.DB_USER);
const port = process.env.PORT ||  5000;

app.use(cors())
app.use(bodyParser.json())
app.use(express.static('doctors'));
app.use(fileUpload());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.2xoju.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
//console.log(uri);

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const appointmentCollection = client.db("doctorsPortal").collection("appointment");
  const doctorCollection = client.db("doctorsPortal").collection("doctors");
  
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
    const email = req.body.email

    doctorCollection.find({email: email})
    .toArray((err, doctors) => {
      const filter = {date:date.date}
      if(doctors.length===0){
        filter.email=email
      }

      appointmentCollection.find(filter)
      .toArray((err, documents) => {
        res.send(documents)
      })
    })


    
  })

    app.post('/addADoctor', (req, res) =>{
      const email = req.body.myEmail
      const name = req.body.myName
      const file = req.files.myFile
      const newImg = file.data;
        const encImg = newImg.toString('base64');

        var image = {
            contentType: file.mimetype,
            size: file.size,
            img: Buffer.from(encImg, 'base64')
        };

        doctorCollection.insertOne({ name, email, image })
            .then(result => {
                res.send(result.insertedCount > 0);
            })
    })

    app.get('/doctors', (req, res) => {
        doctorCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    });

  
});


app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})