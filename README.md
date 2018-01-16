# nodejs-mongo-client
Basic dockerized nodejs application using mongodb

## Build docker image
docker build --rm -t nodejs-mongo-client:0.0.1 .

## Run the container
docker run --rm --name nodejs-mongo-client nodejs-mongo-client:0.0.1

If your mongodb instance run as a docker swarm service, and in an overlay network, you have to attach the container to the same network. This allows the application connecting to the mongodb instance using the service name. In this case, launch the container as follows:
docker run --rm --network NETWORK-NAME --name nodejs-mongo-client nodejs-mongo-client:0.0.1
