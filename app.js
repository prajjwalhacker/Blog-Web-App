//jshint esversion:6
require('dotenv').config({path: __dirname + '/.env'});
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const { endsWith } = require("lodash");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");


var flag = false;

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.use(session({
  secret : "Our little Secret.",
  resave : false,
  saveUninitialized : false
}));


app.use(passport.initialize());
app.use(passport.session());


///mongoose.connect("mongodb://localhost:27017/dailyblog", {useNewUrlParser: true, useUnifiedTopology: true});

mongoose.connect("mongodb+srv://admin-prajjwal:lera1234@cluster0.xp99h.mongodb.net/usersDB", {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.set("useCreateIndex", true);

itemsSchema = new mongoose.Schema({
  title : String,
  content : String,
  isFlag : Boolean,
  author : String
});

userSchema = new mongoose.Schema({
  email : String,
  password : String
}
);

userSchema.plugin(passportLocalMongoose);


const User = new mongoose.model("User", userSchema);

const Item = new mongoose.model("Item", itemsSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.get("/", function(req,res){
  Item.find({}, function(err, foundItems){
    res.render("home", {tt : foundItems, Flag : flag});
  })
    
});


app.get("/posts/:topic", function(req,res){
   Item.find({},function(err, foundItems){
    
    /*for(var i =0;i<foundItems.length;i++){
      console.log(foundItems[i].title);
    }*/

    res.render("post", {temp: req.params.topic, tmp : foundItems, Flag : flag});
   });
   
});

app.get("/register",function(req,res){
    res.render("register", {Flag : flag});
});

app.post("/register",function(req,res){
  User.register({username: req.body.username}, req.body.password , function(err,user){
    if(err){
        res.redirect("/register");
    }
    else{
        passport.authenticate("local")(req,res, function(){
            res.redirect("/");
        });
    }
})
});

let ss = "";

let usernamee;

app.post("/login", function(req,res){
   
  const user = new User({
     username : req.body.username,
     password : req.body.password
  }
  );
  usernamee = req.body.username;
  req.login(user, function(err){
      if(err){
         console.log(err);
      }
      else{
         passport.authenticate("local")(req,res, function(){
             flag = req.isAuthenticated();
             for(let i=0;i<usernamee.length;i++){
              if(usernamee[i] === '@'){
                break;
              }
              ss = ss + usernamee[i];
         }
             res.redirect("/");
         });
      }
  });
});

app.get("/compose", function(req,res){
  if(req.isAuthenticated()){
      res.render("compose" , {Flag : flag});
  }
  else{
      res.redirect("/login");
  }
});

app.get("/login",function(req,res){
    res.render("login" , {Flag : flag});
});

app.get("/logout", function(req,res){
  req.logout();
  flag = false;
  res.redirect("/");
});


app.post("/", function(req,res){
    const tmp = new Item({
      title : req.body.posttitle,
      content : req.body.article,
      isFlag : false,
      author : ss
    });
    tmp.save();
    res.render("message", {Flag : flag});
});


app.post("/admin_login", function(req,res){
     if(req.body.username === process.env.USERNAME && req.body.password === process.env.PASSWORD){
           res.render("secret");
           
     }
     else{
       res.render("admin");
     }       
});


app.get("/about",function(req,res){
    res.render("about", {Flag : flag});
});

app.get("/admin", function(req,res){
    res.render("admin");
});

let port = process.env.PORT;
if(port == null || port  == ""){
  port = 3000;
}

app.listen(port, function() {
  console.log("Server started on port 3000");
});

app.get("/profile", function(req,res){
    let ss = "";
    res.render("profile", {s : ss, Flag : flag});
});