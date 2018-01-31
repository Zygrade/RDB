const express = require('express');
const exphbrs = require('express-handlebars');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const redis = require('redis');

const app = express();

// Redis Client
let redisClient = redis.createClient();

redisClient.on('connect',()=>{
  console.log('Connected to Redis');
});

redisClient.on('error',function(error){
  console.log("Error -> " + error);
});

// View Engine
app.engine('handlebars',exphbrs({defaultLayout:'main'}));
app.set('view engine','handlebars');

// Body Parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));

// Method override - Used to delete the entries
app.use(methodOverride('_method'));

// Search Page
app.get('/',(req,res)=>{
    res.render('searchusers');
});

// Post request for search user form
app.post('/user/search', (req,res)=>{
    let id = req.body.id;

    redisClient.hgetall(id, (error,obj)=>{
      if(!obj) {
        res.render('searchusers',{error:'No user with that id exists'});
      } else {
        obj.id = id;
        res.render('details',{user:obj});
      }

    });
});

// Add Page
app.get('/user/add',(req,res)=>{
    res.render('addusers');
});

// Post request for add user form
app.post('/user/add', (req,res)=>{
    let id = req.body.id;
    let first_name = req.body.first_name;
    let last_name = req.body.last_name;
    let email = req.body.email;
    let phone = req.body.phone;

    redisClient.hmset(id, [
      'first_name', first_name,
      'last_name', last_name,
      'email', email,
      'phone', phone
    ], (error,reply)=>{
      if(error) {
        console.log(error);
      }
      else {
        console.log(reply);
        res.redirect('/');
      }
    });
});

// Delete entries from database
app.delete('/user/delete/:id', (req,res)=>{
    redisClient.del(req.params.id);
    res.redirect('/');
});

app.listen('3000',()=>{
  console.log('server->on');
});
