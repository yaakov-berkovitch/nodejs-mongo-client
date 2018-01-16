//Import the mongoose module
var mongoose = require('mongoose');
//
//Set up default mongoose connection
var mongoDB = 'mongodb://epic_mongodb:27017/paas-auth-db';
//var options = { replicaSet: 'rs0', useMongoClient: true};
var options = { replicaSet: 'rs0', useMongoClient: false};

mongoose.connect(mongoDB, options) ;
 
// Get Mongoose to use the global promise library
mongoose.Promise = global.Promise;
//Get the default connection
var db = mongoose.connection;

//Bind connection to error event (to get notification of connection errors)
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.on('connected', () => {console.info('Connected to MongoDB!');});

// Define a schema
var userSchema = new mongoose.Schema({
  email: { type: String, unique: true, lowercase: true },
  password: String,
  creationtime: Date,
});

var user = mongoose.model('users', userSchema);

// find all users 
user.find({ }, function (err, users) {
	if (err) return handleError(err);
	// 'users' contains the list of users
	console.log('User list = ' + users)
})

// find specific user
user.find({'email' : 'user8@gmail.com'}, function (err, foundUser) {
	if (err) return handleError(err);
	// 'users' contains the user retrieved from database
	console.log('Found one user = ' + foundUser)
})

setTimeout (function() {console.log('Terminating'); process.exit(0);}, 10000) ;

function handleError(error) {
	console.log('Error handling - error = ', error);
}

