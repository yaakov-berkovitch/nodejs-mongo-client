'use strict';

//Import the mongoose module
var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var bodyParser = require('body-parser');
var os = require('os');
const express = require('express')
const app = express()
const listenPort = process.env.LISTEN_PORT ;

// Initialize express
app.use(bodyParser.json());

// Initialize mongo client

/*
 * Singleton mongo client wrapper
 */
class MongoDBClient {
	constructor() {
		if (! MongoDBClient.instance) {
			MongoDBClient.instance = this;
			this.servername = process.env.MONGODB_SERVER_NAME ;
			//Set up default mongoose connection
			this.mongoDB = 'mongodb://' + this.servername + ':27017/paas-auth-db';
			//var options = { replicaSet: 'rs0', useMongoClient: true};
			this.options = { replicaSet: 'rs0', useMongoClient: false};
			// Get Mongoose to use the global promise library
			mongoose.Promise = global.Promise;
			//Get the default connection
			this.db = mongoose.connection;
			console.log('Instantiate MongoDBClient');
		}
		return MongoDBClient.instance;
	}

	init() {
		mongoose.connect(this.mongoDB, this.options) ;
		//Bind connection to error event (to get notification of connection errors)
		this.db.on('error', console.error.bind(console, 'MongoDB connection error to server = ', this.servername));
		this.db.on('connected', () => {console.info('Connected to MongoDB server = ', this.servername);});
	}
}
const mongoDBClientWrapperInstance = new MongoDBClient();
mongoDBClientWrapperInstance.init();

/*
 * Singleton user management
 */
class UserManagement {
	constructor() {
		if (! UserManagement.instance) {
			UserManagement.instance = this;
			// Define a schema
			this.userSchema = new mongoose.Schema({
				email: { type: String, unique: true, lowercase: true },
				password: String,
				creationtime: { type: Date, default: Date.now},
			});
			this.user = mongoose.model('users', this.userSchema);
			// encrypt the password before save
			this.userSchema.pre('save', function (next) {
				const userInstance = this;
				if (!userInstance.isModified('password')) {
					return next();
				}
				bcrypt.genSalt(10, function(err, salt) {
					if (err) {
						return next(err);
					}
					bcrypt.hash(userInstance.password, salt, null, function(err, hash) {
						if (err) {
							return next(err);
						}
						userInstance.password = hash;
						next();
					});
				});
			});
			console.log('Instantiate UserManagement');
		}
		return UserManagement.instance;
	}

	// find all users
	async getAllUsers () {
		try {
			const users = await this.user.find({}).exec();
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
			const dbuser = await this.user.find({'email' : username}).exec() ;
			// 'foundUser' contains the user retrieved
			console.log('getUser - success - user = ', dbuser)
			return dbuser ;
		} catch (err) {
			console.log('getUser - exception occurred = ', err)
			return undefined ;
		}
	}

	// create user
	async createUser (userdata) {
		try {
			const newuser = await this.user.create({email : userdata.email, password : userdata.password});
			// 'newuser' contains the user created
			if (newuser !== undefined) {
				console.log('createUser - success - user = ', newuser)
				return newuser ;
			}
			else {
				return undefined ;
			}
		} catch (err) {
			console.log('createUser - exception occurred = ', err)
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
	console.log('Incoming get all user request')
	try {
		const users = await userManagerWrapperInstance.getAllUsers();
		console.log('User list = ', users)
		if (users === undefined) {
			res.status(500).send();
		}
		else {
			res.json(users)
		}
	} catch (err) {
		res.status(500).send(err)
	}
})
app.get('/user/:username', async (req, res) => {
	console.log('Incoming get user request - user = ', req.params.username)
	try {
		const user = await userManagerWrapperInstance.getUser(req.params.username);
		console.log('User found = ', user)
		if (new_user === undefined) {
			res.status(404).send();
		}
		else {
			res.json(user)
		}
	} catch (err) {
		res.status(500).send(err)
	}
})
app.post('/user', async (req, res) => {
	console.log('Incoming user creation request - data = ', req.body)
	try {
		const new_user = await userManagerWrapperInstance.createUser(req.body);
		console.log('User created = ', new_user)
		if (new_user === undefined) {
			res.status(500).send();
		}
		else {
			res.json(new_user)
		}
	} catch (err) {
		res.status(500).send(err)
	}
})

app.listen(listenPort, () => console.log('Application listening on port ', listenPort))

