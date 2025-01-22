const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config()
const mongoose = require('mongoose')



//connecting to mongoDB
const connectToMongoDB = async () => {
  try {
    // Connexion à MongoDB
    await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connexion à MongoDB réussie !');
  } catch (error) {
    // Gestion des erreurs
    console.error('Échec de la connexion à MongoDB :', error.message);
  }
};
connectToMongoDB();

//Setting the middlewares
app.use(bodyParser.urlencoded({extended: false}))
app.use(cors())
app.use(express.static('public'))

//Launching the main view
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});


//Creating the Schemas
const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
});

const exerciceSchema = new mongoose.Schema({
  username:String,
  description : String,
  duration: Number,
  date : Date,
});


//Creating the Models
const User = mongoose.model('User', userSchema);
const Exercise = mongoose.model('Exercise', exerciceSchema);

//Creating actions on my data
const createAndSaveUser = function(user,done){
  user = new User({username: user});
  user.save((err, data) => {
    if(err) return console.error(err);
    done(null, data);
  });
}

const findOneUserByID = async function(userId,done){
 await User.findById(userId,(err,userFound) => {
    if(err) return console.error("Error: ",err);
    done(null,userFound);
  });
};


const createAndSaveExercice = async function(exo,userId,done){
  var user = {};
  await findOneUserByID(userId,(err,userFound) => {
    if (err) return console.error('User not Found ',err);
    if (userFound){
    user = userFound;
    };
  });
  exo = new Exercise({
    username :user.username,
    description: exo.description,
    duration: exo.duration,
    date: exo.date
  });
  exo.save((err, data) => {
    if(err) return console.error(err);
    done(null, data);
  });
};


const findAllUser =(done) => {
  User.find({},(err,usersFound) => {
    if (err) return console.log("Error: ",err);
    done(null,usersFound); 
  });  
};
const findExerciseByUsername = (usernamedone) => {
  Exercise.find({username :username},(err,exercicesFound) => {
    if (err) return console.error("Error: ",err);
    done(null,exercicesFound);  
  }); 
};


//Routes for database querying

//registering an user
app.post('/api/users',(req,res) => {
  const user = req.body.username;
  createAndSaveUser(user,(err,data) => {
    if (err) return console.error('Error',err,' while creating user');
    if(data) return res.json(data);
  });
});

//registering an exercice
app.post('/api/users/:_id/exercises',(req,res) => {
  const userId = req.params._id;
  const exo = {
    description: req.body.description,
    duration: parseInt(req.body.duration), 
    date: req.body.date};
  createAndSaveExercice(exo,userId,(err,data) => {
    if (err) return console.error('Error',err,' while creating Exercise');
    if(data){ 
      const output = {
        _id:userId,
        username:data.username,
        exercise:exo
      }
      return res.json(output)};
  });
});

//Fetching data
app.get('/api/users',(req,res) => {
  const userId=req.params.id;
  findAllUser((err,userFound) => {
    if(err) console.log('Error: ', err);
    if(userFound) return res.json(userFound);
    
  })
  
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
