.PHONY: help build up down dev dev-down clean backend frontend

# Default target executed when no arguments are given to make.
help:
	@echo "Available commands:"
	@echo "  make build      - Build all Docker images"
	@echo "  make up         - Start all containers"
	@echo "  make down       - Stop all containers"
	@echo "  make clean      - Remove all containers, networks, volumes, and images"
	@echo "  make deploy-frontend - Deploy frontend to Fly.io"
	@echo "  make deploy-backend  - Deploy backend to Fly.io"
	@echo "  make logs-frontend   - Show frontend logs from Fly.io"
	@echo "  make logs-backend    - Show backend logs from Fly.io"
	@echo "  make config-backend-from-env - Set backend secrets on Fly.io from .env file"


# DOCKER COMMANDS
# Build all Docker images
build:
	docker-compose -f infra/docker-compose.yml build

# Start all containers
up:
	docker-compose -f infra/docker-compose.yml up -d

# Stop all containers
down:
	docker-compose -f infra/docker-compose.yml down

# Remove all containers, networks, volumes, and images
clean:
	docker-compose -f infra/docker-compose.yml down -v --rmi all


# DEPLOY COMMANDS
deploy-frontend:
	cd MarketEdge && fly deploy

deploy-backend:
	cd bk && fly deploy

logs-frontend:
	cd MarketEdge && fly logs

logs-backend:
	cd bk && fly logs

# Set backend secrets on Fly.io from .env file
config-backend-from-env:
	cd bk && fly secrets set THE_ODDS_API_KEY="$(grep 'THE_ODDS_API_KEY=' .env | cut -d= -f2)"
	cd bk && fly secrets set SUPABASE_URL="$(grep 'SUPABASE_URL=' .env | cut -d= -f2)"
	cd bk && fly secrets set SUPABASE_KEY="$(grep 'SUPABASE_KEY=' .env | cut -d= -f2)"
