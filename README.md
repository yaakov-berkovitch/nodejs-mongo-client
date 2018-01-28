# nodejs-mongo-client
Basic dockerized nodejs application using mongodb.
This project makes usage of:
* express
* mongoose
* async/await

## Build docker image
docker build --rm -t nodejs-mongo-client:0.0.1 .

## Run as a container
Before creating the service, set the environment variables:
* NETWORK_NAME: this your swarm overlay network
<br><br>
__docker run__ -d \
	--rm \
	--network ${NETWORK_NAME} \
	--name nodejs-mongo-client \
	--env MONGODB_SERVER_NAME=<swarm service name or mongo server IP/Name> \
	--env LISTEN_PORT=3000 \
	--publish 3331:3000 \
	nodejs-mongo-client:0.0.1
<br>
If your mongodb instance run as a docker swarm service, and in an overlay network, you have to attach the container to the same network. This allows the application connecting to the mongodb instance using the service name. In this case, launch the container as follows:
docker run --rm --network NETWORK-NAME --name nodejs-mongo-client nodejs-mongo-client:0.0.1

## Run as a service
Before creating the service, set the environment variables:
* NETWORK_NAME: this your swarm overlay network
* SERVICE_NAME: service name that will be pusblished by swarm
<br><br>
__docker service create__ \
	--mode global \
	--network ${NETWORK_NAME} \
	--name nodejs-mongo-client \
	--env MONGODB_SERVER_NAME=<swarm mongo service name> \
	--env LISTEN_PORT=3000 \
	--publish target=3000,published=3331 \
	nodejs-mongo-client:0.0.1
To check your service is created and running, run docker service ls

## Check your service
* list the existing users : curl http://localhost:3331/users
* get specific user : curl http://localhost:3331/user/<username>

