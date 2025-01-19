require('dotenv').config();
let bodyParser = require('body-parser');
let express = require('express');
let app = express();

app.use(bodyParser.urlencoded({extended: false}));

//the view and public routes are defined
view_route = __dirname +'/views/index.html';
public_route = __dirname +"/public/";

//the middleware function logs the request method, the request path and the ip address of the client
app.use(function middleware(req, res, next) {
    console.log(req.method + " " + req.path + " - " + req.ip);
    next();
})
//the public folder is made static and the css file is served from there to style the index.html file
app.use('/public',express.static(public_route));

//the route http://localhost:3000/ will return the index.html file
app.get("/", function(req, res) {
    res.sendFile(view_route);
})

//the route http://localhost:3000/json will return a json object with the message "Hello json" if the environment variable MESSAGE_STYLE is not set
app.get("/json", function(req, res) {
    message = process.env.MESSAGE_STYLE;
    if (message == "uppercase"){
        return res.json({"message": "HELLO JSON"});
    }
    else{
        return res.json({"message": "Hello json"});
    }
    return res.json({"message": "Hello json"});});


//the route http://localhost:3000/now will return the current time in a json object  
app.get('/now',function(req,res,next){
    req.time = new Date().toString();  
    next()
},function(req,res){
    return res.json({time:req.time});
});

//the route http://localhost:3000/:word/echo will return the 'word' in the url before 'echo/' in a json object
app.get('/:word/echo',function(req,res){
    return res.json({echo:req.params.word})});


// the route http://localhost:3000/name/?first=toukap&last=nono will set 'first' parameter to toukap and 'last' parameter to nono
app.get('/name',function(req,res){
    return res.json({name:req.query.first + " " + req.query.last})} 
);

app.post('/name',function(req,res){
    return res.json({name:req.body.first + " " + req.body.last})});




























 module.exports = app;
