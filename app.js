'use strict';

//Import the mongoose module
var mongoose = require('mongoose');
var os = require('os');
const express = require('express')
const app = express()
const servername = process.env.MONGODB_SERVER_NAME ;
const listenPort = process.env.LISTEN_PORT ;

//Set up default mongoose connection
var mongoDB = 'mongodb://' + servername + ':27017/paas-auth-db';
//var options = { replicaSet: 'rs0', useMongoClient: true};
var options = { replicaSet: 'rs0', useMongoClient: false};

mongoose.connect(mongoDB, options) ;
 
// Get Mongoose to use the global promise library
mongoose.Promise = global.Promise;
//Get the default connection
var db = mongoose.connection;

//Bind connection to error event (to get notification of connection errors)
db.on('error', console.error.bind(console, 'MongoDB connection error to server = ', servername));
db.on('connected', () => {console.info('Connected to MongoDB server = ', servername);});

// Define a schema
var userSchema = new mongoose.Schema({
	email: { type: String, unique: true, lowercase: true },
	password: String,
	creationtime: Date,
});

var user = mongoose.model('users', userSchema);

class UserManagement {
	constructor() {
		if (! UserManagement.instance) {
			UserManagement.instance = this;
			console.log('Instantiate UserManagement');
		}
		return UserManagement.instance;
	}

	// find all users
	async getAllUsers () {
		try {
			const users = await user.find({}).exec();
			console.log('getAllUsers - success - users = ', users)
			return users ;
		} catch (err) {
			console.log('getAllUsers - exception occurred = ', err)
			return undefined ;
		}
	}

	// find specific user
	async getUser (username) {
		try {
			const dbuser = await user.find({'email' : username}) ;
			// 'foundUser' contains the user retrieved
			console.log('getUser - success - user = ', dbuser)
			return dbuser ;
		} catch (err) {
			console.log('getUser - exception occurred = ', err)
			return undefined ;
		}
	}

	handleError(error) {
		console.log('Error handling - error = ', error);
	}
}
const userManagerWrapperInstance = new UserManagement();

app.get('/', (req, res) => res.send('Hello World - Server = ' + os.hostname() + '\n'))
app.get('/users', async (req, res) => {
	try {
		const users = await userManagerWrapperInstance.getAllUsers();
		console.log('User list = ', users)
		res.json(users)
	} catch (err) {
		res.status(500).send(err)
	}
})
app.get('/user/:username', async (req, res) => {
	try {
		const user = await userManagerWrapperInstance.getUser(req.params.username);
		console.log('User found = ', user)
		res.json(user)
	} catch (err) {
		res.status(500).send(err)
	}
})

app.listen(listenPort, () => console.log('Example app listening on port ', listenPort))

