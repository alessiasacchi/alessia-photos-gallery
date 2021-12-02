var express = require("express");
const fs = require('fs');
const parse = require('node-html-parser').parse;
var bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const nodefetch = require('node-fetch');
const request = require('request');

var app = express();
var router = express.Router();
 
var path = __dirname + '/views/';
var photos_id_list = require(__dirname + '/photos_id_list.json');

app.use(bodyParser.urlencoded({ extended : false }));
app.use(bodyParser.json()) // for parsing application/json
app.use('/css',express.static(__dirname +'/views/css'));
app.use('/img',express.static(__dirname +'/views/img'));
app.use('/scripts', express.static(__dirname + '/node_modules/bootstrap/'));
app.use('/swipebox', express.static(__dirname + '/views/swipebox/'));
app.use("/",router);
 
router.use(function (req,res,next) {
  //res.header("Access-Control-Allow-Origin", "*");
  //res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
 
router.get("/",function(req,res){
  res.sendFile(path + "home.html");
});
 
router.get("/resume",function(req,res){
  res.sendFile(path + "resume.html");
});

router.get("/home",function(req,res){
  res.sendFile(path + "home.html");
});

router.get("/collections",function(req,res){
  
  res.sendFile(path + "collections.html");
});

router.get('/photos', function(req, res){
  
  var collection = req.query.collection;
  
  try {
  	var html = fs.readFileSync(path + 'photos.html', 'utf8');
  	var root = parse(html);
  	var aboutNode = root.querySelector('#aboutTheCollection');
  	var titleNode = root.querySelector('#pagetitle');
  	var htag,ptag,buttons,pagetitle;

  	switch(collection) {
	  case "world":

	    pagetitle = 'From the World';
	    htag = '<h1 class="jumbotron-heading">From the World</h1>';
	    ptag = '<p class="lead text-muted">I strongly believe each and every travel I did over the last ten years helped me discover something new about myself. Re-shuffling them would make no sense, every trip set the foundation for the next one and I would not be who I am without the people I met in my peregrinations around the World.</p>';
	    buttons = '<p><a href="/photos?collection=ocean" class="btn btn-primary my-2">Ocean</a><a href="/photos?collection=wildlife" class="btn btn-primary my-2">Wildlife</a></p>';
	    aboutNode.appendChild(htag + ptag + buttons);
	    titleNode.appendChild(pagetitle);
	    break;
	  case "ocean":
	    pagetitle = 'Ocean';
	    htag = '<h1 class="jumbotron-heading">Ocean</h1>';
	    ptag = '<p class="lead text-muted">Ocean is a collection of underwater photos from the Pacific where I had the privilege to dive for the last six years of my life. What started as a hobby over several years turned into a passion and a need. Today I believe the Ocean drives my life in many ways.</p>';
	    buttons = '<p><a href="/photos?collection=wildlife" class="btn btn-primary my-2">Wildlife</a><a href="/photos?collection=world" class="btn btn-primary my-2">From the World</a></p>';
	    aboutNode.appendChild(htag + ptag + buttons);
	    titleNode.appendChild(pagetitle);
	    break;
	  case "wildlife":
	    pagetitle = 'Wildlife';
	    htag = '<h1 class="jumbotron-heading">Wildlife</h1>';
	    ptag = '<p class="lead text-muted">So glad you landed on this page! You are about to meet my gorgeous wild friends: Jimbo the Koala, Peter the Pelican, Sussy the Sealion and many more. Each of these animals have a special space in my heart and every photo has a beautiful story behind it. They come from all over Australia and the Galápagos Islands.</p>';
	    buttons = '<p><a href="/photos?collection=ocean" class="btn btn-primary my-2">Ocean</a><a href="/photos?collection=world" class="btn btn-primary my-2">From the World</a></p>';
	    aboutNode.appendChild(htag + ptag + buttons);
	    titleNode.appendChild(pagetitle);
	    break;  
	  default:
	    
	}


  	var galleryNode = root.querySelector('#gallery');

  	if (photos_id_list != null) {
  		
		for (var i in photos_id_list){
			
			if(photos_id_list[i].collection != null && photos_id_list[i].collection == collection) {
			  	var id = photos_id_list[i].id;
			  	var caption = photos_id_list[i].caption;
			  	var atag = '<a href="https://drive.google.com/uc?export=view&id=' + id + '" class="swipebox" title="' + caption + '">';
			  	var imgtag = '<img src="https://drive.google.com/thumbnail?id=' + id + '" class="image"/></a>';
			  	//var imgtag = '<img src="https://lh3.googleusercontent.com/d/' + id + '=s220?authuser=0' + '" class="image"/></a>';
			  	var node = atag + imgtag;
			  	galleryNode.appendChild(node);
			}  	
		}
	}
	res.set('Content-Type', 'text/html');
  	res.send(root.toString());
  } catch (err) {
  	console.error(err);
  	res.sendFile(path + "404.html");
  }

});

router.get("/contact",function(req,res){
  res.sendFile(path + "contact.html");
});

router.post("/sendMessage",function(req,res){
  
  var strongNode = '';
  var firstName = req.body.firstName;
  var lastName = req.body.lastName;
  var email = req.body.email;
  var message = req.body.message;
  var recaptcharesponse = req.body['g-recaptcha-response'];
  var sender = firstName + " " + lastName + "<" + email + ">";
  var html = fs.readFileSync(path + 'contact.html', 'utf8');
  var root = parse(html);
  var alertMessageDiv = root.querySelector('#alertMessage');
  var firstNameNode = root.querySelector('#firstName');
  var lastNameNode = root.querySelector('#lastName');
  var emailNode = root.querySelector('#email');
  var messageNode = root.querySelector('#message');


  // captcha response verification  
  var url = "https://www.google.com/recaptcha/api/siteverify?secret=6LfCKPIUAAAAABtgWdrOAOS-FQVIw1IQgj4AXLHu&response=" + recaptcharesponse;
  	
  request.post(url, (error, response, body) => {
	  if (error) {
	    console.error(error);
	    var alertMessage = '<p>I need to verify if you are bot or a human. Please check the box in the form below.</p>';
	  	alertMessageDiv.appendChild(alertMessage);
	  	alertMessageDiv.setAttribute('class','alert alert-danger visible alert-dismissible fade show');
	    res.set('Content-Type', 'text/html');
  	  	res.send(root.toString());
  	  	return;
	  }
	  var response = JSON.parse(body);
	  var status = response.success;
	  if(status == false){
	  	var alertMessage = '<p>I need to verify you are a person. Please check the captcha box in the form below.</p>';
	  	alertMessageDiv.appendChild(alertMessage);
	  	alertMessageDiv.setAttribute('class','alert alert-danger visible alert-dismissible fade show');
	    res.set('Content-Type', 'text/html');
  	  	res.send(root.toString());
	  }
	  
  });

  // send email using nodemailer
  /*
  var transport = nodemailer.createTransport({
	  host: "smtp.mailtrap.io",
	  port: 2525,
	  auth: {
	    user: "7c315f4830c27e",
	    pass: "e5628b741739c2"
	  }
  });
  */

  var transport = nodemailer.createTransport({
	  service: 'gmail',
	  auth: {
	    user: "alessia.sacchicomm@gmail.com",
	    pass: "ms07n79AP"
	  }
  });


  let mailOptions = {
      from: sender,
      to: 'alessia.sacchicomm@gmail.com', // list of receivers
      subject: "Feedback from " + sender, // Subject line
      text: message // plain text body
  };

  transport.sendMail(mailOptions, (error, info) => {
      if (error) {
      	  var alertMessage = '<strong>Ups,something went wrong.</strong><p>Please try to resend your message again</p>';
	  	  alertMessageDiv.appendChild(alertMessage);
	  	  alertMessageDiv.setAttribute('class','alert alert-danger visible alert-dismissible fade show');
          firstNameNode.setAttribute('value',firstName);
          lastNameNode.setAttribute('value',lastName);
          emailNode.setAttribute('value',email);
          messageNode.appendChild(message);
          console.log(error);
      } else {
	      console.log('Message %s sent: %s', info.messageId, info.response);
		  var alertMessage = '<strong>Sent!</strong><p>I appreciate your feedback, thanks for writing me. I will review your message and get back to you if needed</p>';
		  alertMessageDiv.appendChild(alertMessage);
		  alertMessageDiv.setAttribute('class','alert alert-success visible alert-dismissible fade show');
	  }
	  res.set('Content-Type', 'text/html');
  	  res.send(root.toString());
  });

});


app.use("*",function(req,res){
  res.sendFile(path + "404.html");
});
 
app.listen(8081, function () {
  console.log('Example app listening on port 8081!')
})


