-include .env

init: ## Init the project
	docker-compose build --no-cache --progress plain
	npm install

start: ## To start the containers
	docker-compose up wallet-notifications-service

down: ## To stop the containers
	docker-compose down