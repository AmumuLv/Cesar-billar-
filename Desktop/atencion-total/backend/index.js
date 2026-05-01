
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const routes = require('./routes/contactRoutes');
const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://mongo:27017/atencionTotalDB')
.then(()=>console.log("Mongo conectado"))
.catch(err=>console.log(err));

app.use('/api/contacts', routes);

app.listen(3000, ()=>console.log("Servidor 3000"));
