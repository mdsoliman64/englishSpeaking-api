require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const app = express();
const bodyParser = require("body-parser");
const ejs = require("ejs");
const bcrypt = require('bcrypt');
const saltRounds = 10;
const secrets = process.env.SECRETS;
const mail = process.env.MAIL;
const cors = require("cors");
const PORT = process.env.PORT || 5000;




/////////////// Control API////////////////
var whiteList = ["https://learnenglish-dgff.onrender.com/","https://mdsoliman64.github.io/learnenglish"]
/*const corsOptions = {
    origin:"https://learnenglish-dgff.onrender.com/",
    methods: 'GET,HEAD,PUT,DELETE',
    credentials: true,
    optionsSuccessStatus: 204, 
}
app.use(cors(corsOptions));
*/


var corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
}

////////////////////////////////
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.use(express.json());
///////////////////////////////////////
const api_ID= process.env.USER_ID;



//////////////////////////////////////
mongoose.connect(process.env.uri,{useNewUrlParser:true});
const userSchema =new mongoose.Schema({
    email:String,
    password:String
});

const Admin = mongoose.model("admin",userSchema);
/////////////////////////////////////////////////////
bcrypt.genSalt(saltRounds, function(err, salt) {


    bcrypt.hash(secrets, saltRounds).then(function(hash) {
        // Store hash in your password DB.
        const admin = new Admin({
            email:mail,
            password:hash
        });  


        Admin.findOne({email:mail}).then((found)=>{

            if(found){
                console.log("....");
            }else{
                admin.save();
            };
          })  ;

    });

 
});



///////////////////////////////////////////////////
const postSchema = mongoose.Schema({
    title:String,
    ///////// changing ////////////////////
    clue:{
        first:String,
        second:String,
        third:String,
        fourth:String,
        fifth:String,
        sixth:String
    }

});

const Post = mongoose.model("post",postSchema);


////////////////////////////////
app.get('/api_id='+api_ID,cors(corsOptions),(req,res)=>{

Post.find({}).then((found)=>{
    res.send(found);
}).catch((err)=>{
    console.log(err.message);
})

})
/////////////////////////////////

app.get("/",(req,res)=>{
    res.render("home")
})
app.post("/",(req,res)=>{
const password = req.body.password;
const email = req.body.email;


Admin.findOne({email:email}).then((found)=>{
 
    if(found){

        bcrypt.compare(password,found.password).then(function(result) {
            // result == true
            if(result == true){
                res.render("compose");
                console.log("successfully login");
            }else if(result == false){
                
                res.redirect("/");
            };
        });
}else{
res.redirect("/");
}
  
}).catch((err)=>{
    console.log(err);
    
});


});


app.post("/admin/composer",(req,res)=>{


//////////////////////////////////////////////////////////    

const post = new Post({
    title : req.body.title,
    clue:{
        first:req.body.clue1,
        second:req.body.clue2,
        third:req.body.clue3,
        fourth:req.body.clue4,
        fifth:req.body.clue5,
        sixth:req.body.clue6
    }
});

Post.findOne({title:req.body.title}).then((found)=>{
    if(found){
        res.send("<h1>this post is already exist</h1>");
        console.log("This post is exist");
    }else{
        post.save().then((success)=>{
            res.redirect("/");
        }).catch((err)=>{
                console.log(err);
        });
    };
}).catch((err)=>{
    console.log(err);
});


});
////////////////////////////////////////////////
app.listen(PORT,()=>{
    console.log("listening"+PORT);
});
