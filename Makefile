.PHONY: help build up down dev dev-down clean backend frontend

# Default target executed when no arguments are given to make.
help:
	@echo "Available commands:"
	@echo "  make build      - Build all Docker images"
	@echo "  make up         - Start all containers"
	@echo "  make down       - Stop all containers"
	@echo "  make clean      - Remove all containers, networks, volumes, and images"
	@echo "  make backend    - Start backend service only"
	@echo "  make frontend   - Start frontend service only"
	@echo "  make set-backend-secrets - Set backend secrets on Fly.io from .env file"
	@echo "  make set-backend-secrets-from-zsh - Set backend secrets on Fly.io from .zshrc file"


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

# Set backend secrets on Fly.io from .zshrc file
config-backend-from-zsh-config:
	cd bk && fly secrets set THE_ODDS_API_KEY="$$(grep 'export THE_ODDS_API_KEY=' ~/.zshrc | cut -d= -f2)"
	cd bk && fly secrets set SUPABASE_URL="$$(grep 'export SUPABASE_URL=' ~/.zshrc | cut -d= -f2)"
	cd bk && fly secrets set SUPABASE_KEY="$$(grep 'export SUPABASE_KEY=' ~/.zshrc | cut -d= -f2)"
