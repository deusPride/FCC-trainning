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


const createAndSaveExercice = async function (exo, userId, done) {
  try {
    const user = await User.findById(userId);
    if (!user) {
      return done(new Error('Utilisateur non trouvé'), null);
    }

    const exerciseData = {
      username: user.username,
      description: exo.description,
      duration: exo.duration,
      date: exo.date ? new Date(exo.date) : new Date(),
    };

    const exercise = new Exercise(exerciseData);
    const savedExercise = await exercise.save();
    done(null, savedExercise);
  } catch (err) {
    done(err, null);
  }
};


const findAllUser =(done) => {
  User.find({},(err,usersFound) => {
    if (err) return console.log("Error: ",err);
    done(null,usersFound); 
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
app.post('/api/users/:_id/exercises', async (req, res) => {
  const userId = req.params._id;
  const exo = {
    description: req.body.description,
    duration: parseInt(req.body.duration),
    date: req.body.date,
  };

  createAndSaveExercice(exo, userId, (err, data) => {
    if (err) {
      console.error('Erreur lors de la création de l’exercice:', err.message);
      return res.status(400).json({ error: err.message });
    }

    // Formater la sortie pour inclure uniquement les champs nécessaires
    const output = {
      _id: userId,
      username: data.username,
      description: data.description,
      duration: data.duration,
      date: data.date.toDateString(), // Formater la date pour qu’elle soit lisible
    };
    res.json(output);
  });
});

//Fetching data

//Fetching the users list
app.get('/api/users',(req,res) => {
  const userId=req.params.id;
  findAllUser((err,userFound) => {
    if(err) console.log('Error: ', err);
    if(userFound) return res.json(userFound);
    
  })
  
})

app.get('/api/users/:_id/logs', async (req, res) => {
  try {
    const { from, to, limit } = req.query;
    const userId = req.params._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    const query = { username: user.username };

    if (from || to) {
      query.date = {};
      if (from) query.date.$gte = new Date(from);
      if (to) query.date.$lte = new Date(to);
    }

    const exercises = await Exercise.find(query)
      .limit(parseInt(limit) || 0);

    const output = {
      _id: user._id,
      username: user.username,
      count: exercises.length,
      log: exercises.map(ex => ({
        description: ex.description,
        duration: ex.duration,
        date: ex.date.toDateString(),
      })),
    };

    res.json(output);
  } catch (err) {
    console.error('Erreur:', err);
    res.status(500).json({ error: 'Une erreur s’est produite' });
  }
});



const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
