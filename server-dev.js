const Joi = require('joi');
// const config = require('./config.js');
const express = require('express');
const { send } = require('express/lib/response');
const func = require('joi/lib/types/func');
const app = express();
const fs = require('fs');
const path = require('path');
const cors = require('cors');




app.use(cors({
  origin: '*'
}));
app.use(express.json());
app.use(express.static('public'));

// Mest Lest , Uka Oppsummert

app.get('/dev', (req, res) => {
  // res.send('Da er vi i gang da.. Ukas Viktigste API');
  console.log(__dirname)
  res.sendFile(path.join(__dirname, '/index.html'));
});

app.get('/dev/articles', (req, res) => {
  let now = getNow();
  let logtext = "get-request to /dev/articles";

  logAccess(logtext, now);

  let foontent = checkFile('./public/ukasviktigste-dev.json');
  res.send(foontent);
});

app.post('/dev/articles/all', (req, res) => {

  let foontent = checkFile('./public/ukasviktigste-dev.json');
  foontent.articles = []; //tømmer gammel data

  foontent.display = req.body.display;
  foontent.title = req.body.title;
  foontent.utm = req.body.utm;

  req.body.articles.forEach(inArticle => {

    // const {error} = validatearticle(inArticle);
    // if(error) {
    //   console.log(error);
    //   return res.status(400).send(error.details[0].message);
    // }

    const article = {
      id: foontent.articles.length + 1,
      url: inArticle.url,
      uuid: inArticle.uuid,
      alt: inArticle.alt,
      title: inArticle.title,
      subtitle: inArticle.subtitle,
      crop: inArticle.crop
    };
    foontent.articles.push(article);

    return
  });

  logAccess("post-request to /dev/articles/all", getNow())

  writeFile('./public/ukasviktigste-dev.json', JSON.stringify(foontent));
  res.send(foontent.articles);
});

app.use(cors({
  origin: '*'
}));

app.post('/api/pass', (req, res) => {

  let password = 'Nationen1918';
  if (req.body.password == password) {
    res.send(true);
    return;
  }
  res.send(false);
});

// Ramsviks oppskrifter

app.get('/dev/oppskrifter', (req, res) => {
  logAccess("get-request to /dev/oppskrifter", getNow());

  let recipes = checkFile('./public/oppskrifter-dev.json');

  res.send(recipes);
});

app.post('/dev/oppskrifter', (req, res) => {

  let foontent = checkFile('./public/oppskrifter-dev.json');
  foontent.recipes = []; //tømmer gammel data

  req.body.display ? foontent.display = req.body.display : foontent.display = "true";
  req.body.title ? foontent.title = req.body.title : foontent.title = "Ramsviks Oppskrifter";
  foontent.utm = "";

  

  req.body.recipes.forEach(recipe => {
    const newRecipe = {
      id: foontent.recipes.length + 1,
      url: recipe.url,
      uuid: recipe.uuid,
      alt: recipe.alt,
      title: recipe.title,
      subtitle: recipe.subtitle,
      crop: recipe.crop
    };

    foontent.recipes.push(newRecipe);

  });

  logAccess("post-request to /dev/oppskrifter", getNow())

  writeFile('./public/oppskrifter-dev.json', JSON.stringify(foontent));
  
  res.send(foontent);
  

});


app.listen(5000, () => {
  console.log('Server running and listening on port 5000')
});

//validates the sendt data
//not correct validation jet
function validatearticle(article) {
  const schema = {
    url: Joi.string(),
    uuid: Joi.string().min(10).max(40),
    alt: Joi.string(),
    subtitle: Joi.string().min(0),
    title: Joi.string().min(7)
  };

  return Joi.validate(article, schema);
}

//read and write functions

function readFile(file) {
  var content = fs.readFileSync(file, 'utf8');
  let time = getNow();
  console.log("Read file", time);
  return content;

}

function writeFile(file, data) {
  fs.writeFileSync(file, data);
  let time = getNow();
  console.log("Written to file", time);
}

function checkFile(file) {

  try {
    if (fs.existsSync(file)) {
      //file exists
      const temp = fs.readFileSync(file, 'utf8').length;
      // file empty
      if (temp === 0) {
        console.log("File is Empty")
        return "File is empty";
      } else {
        return JSON.parse(fs.readFileSync(file, 'utf8'));
      }
    } else { 
      return "file not found" 
    }
  } catch (err) {
    console.error(err)
  }

}

function getNow() {
  let date_ob = new Date();
  let date = ("0" + date_ob.getDate()).slice(-2);

  // current month
  let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);

  // current year
  let year = date_ob.getFullYear();

  // current hours
  let hours = date_ob.getHours();

  // current minutes
  let minutes = date_ob.getMinutes();

  // current seconds
  let seconds = date_ob.getSeconds();

  return year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds
}

function logAccess(text, date) {
  fs.writeFile('./public/log-dev.txt', "\r\n" + text + " " + date, { flag: 'a+' }, err => {
    if (err === null) return;
    let time = getNow();
    console.log('something wrong happened :(', time, err)
  });
}

