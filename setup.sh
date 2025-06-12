#!/bin/bash

# MoodleExamSimulator Setup Script
# This script helps set up the MoodleExamSimulator environment with optimizations
# Includes monitoring, caching, retry mechanisms, and containerization

# Color codes for better readability
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}=========================================${NC}"
echo -e "${BLUE}   MoodleExamSimulator Setup Script      ${NC}"
echo -e "${BLUE}=========================================${NC}"

# Check if Docker is installed
echo -e "\n${YELLOW}Checking if Docker is installed...${NC}"
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Docker is not installed. Please install Docker first.${NC}"
    echo -e "Visit https://docs.docker.com/get-docker/ for installation instructions."
    exit 1
else
    echo -e "${GREEN}Docker is installed!${NC}"
fi

# Check if Docker Compose is installed
echo -e "\n${YELLOW}Checking if Docker Compose is installed...${NC}"
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}Docker Compose is not installed. Please install Docker Compose first.${NC}"
    echo -e "Visit https://docs.docker.com/compose/install/ for installation instructions."
    exit 1
else
    echo -e "${GREEN}Docker Compose is installed!${NC}"
fi

# Check if Python is installed
echo -e "\n${YELLOW}Checking if Python is installed...${NC}"
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}Python 3 is not installed. Please install Python 3 first.${NC}"
    exit 1
else
    echo -e "${GREEN}Python 3 is installed!${NC}"
    python_version=$(python3 --version)
    echo -e "Version: ${python_version}"
fi

# Create virtual environment
echo -e "\n${YELLOW}Setting up Python virtual environment...${NC}"
if [ ! -d "venv" ]; then
    python3 -m venv venv
    echo -e "${GREEN}Virtual environment created!${NC}"
else
    echo -e "${GREEN}Virtual environment already exists.${NC}"
fi

# Activate virtual environment
echo -e "\n${YELLOW}Activating virtual environment...${NC}"
source venv/bin/activate
echo -e "${GREEN}Virtual environment activated!${NC}"

# Install Python dependencies
echo -e "\n${YELLOW}Installing Python dependencies...${NC}"
pip install --upgrade pip
pip install -r requirements.txt

# Install development dependencies for testing
echo -e "\n${YELLOW}Installing development dependencies...${NC}"
pip install pytest pytest-cov flake8 black isort
echo -e "${GREEN}All dependencies installed!${NC}"

# Create necessary directories for monitoring and logs
echo -e "\n${YELLOW}Creating necessary directories...${NC}"
mkdir -p prometheus grafana/provisioning/dashboards grafana/provisioning/datasources logs mongo-init mysql-init
echo -e "${GREEN}Directories created!${NC}"

# Check if .env file exists, if not create it
echo -e "\n${YELLOW}Checking for .env file...${NC}"
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}Creating .env file...${NC}"
    cat > .env << EOF
# Flask configuration
FLASK_APP=web_api.py
FLASK_ENV=development
FLASK_DEBUG=1
SECRET_KEY=your_secret_key_change_in_production

# Database configuration
DATABASE_URL=sqlite:///moodle_exam.db

# Neo4j configuration
NEO4J_HOST=localhost
NEO4J_PORT=7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=password
NEO4J_HEAP_SIZE=1G
NEO4J_PAGECACHE_SIZE=512M
NEO4J_LOG_LEVEL=INFO

# MongoDB configuration
MONGO_HOST=localhost
MONGO_PORT=27017
MONGO_USERNAME=admin
MONGO_PASSWORD=password
MONGO_MAX_POOL_SIZE=100
MONGO_MIN_POOL_SIZE=0
MONGO_MAX_IDLE_TIME_MS=10000

# MySQL configuration
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=moodle
MYSQL_PASSWORD=moodle
MYSQL_DATABASE=moodle
MYSQL_POOL_SIZE=5

# Supabase configuration
SUPABASE_URL=your_supabase_url_here
SUPABASE_KEY=your_supabase_key_here

# Logging configuration
LOG_LEVEL=INFO

# Performance configuration
CACHE_TTL=300
MAX_RETRIES=3
RETRY_DELAY=1000

# Frontend configuration
FRONTEND_API_URL=http://localhost:5000
REACT_APP_ENV=development

# Monitoring configuration
GRAFANA_ADMIN_USER=admin
GRAFANA_ADMIN_PASSWORD=admin
EOF
    echo -e "${GREEN}.env file created! Please edit it with your actual configuration values.${NC}"
else
    echo -e "${GREEN}.env file already exists.${NC}"
fi

# Setup frontend
echo -e "\n${YELLOW}Setting up frontend...${NC}"
if [ -d "web-ui" ]; then
    cd web-ui
    if [ -f "package.json" ]; then
        echo -e "${YELLOW}Installing frontend dependencies...${NC}"
        npm install
        echo -e "${GREEN}Frontend dependencies installed!${NC}"
    else
        echo -e "${RED}package.json not found in web-ui directory.${NC}"
    fi
    cd ..
else
    echo -e "${RED}web-ui directory not found.${NC}"
fi

# Run unit tests
echo -e "\n${YELLOW}Would you like to run the unit tests? (y/n)${NC}"
read -r run_tests

if [ "$run_tests" = "y" ] || [ "$run_tests" = "Y" ]; then
    echo -e "\n${YELLOW}Running unit tests...${NC}"
    python -m pytest tests/
    echo -e "${GREEN}Tests completed!${NC}"
fi

# Start Docker containers
echo -e "\n${YELLOW}Would you like to start the Docker containers now? (y/n)${NC}"
read -r start_docker

if [ "$start_docker" = "y" ] || [ "$start_docker" = "Y" ]; then
    echo -e "\n${YELLOW}Starting Docker containers...${NC}"
    docker-compose up -d
    echo -e "${GREEN}Docker containers started!${NC}"
    
    echo -e "\n${YELLOW}Waiting for services to be ready...${NC}"
    sleep 15
    
    echo -e "\n${GREEN}Setup complete! You can access:${NC}"
    echo -e "- Web API: http://localhost:5000"
    echo -e "- Frontend: http://localhost:3000"
    echo -e "- Neo4j Browser: http://localhost:7474"
    echo -e "- MongoDB: mongodb://localhost:27017"
    echo -e "- MySQL: mysql://localhost:3306"
    echo -e "- Prometheus: http://localhost:9090"
    echo -e "- Grafana: http://localhost:3001 (admin/admin)"
    
    echo -e "\n${YELLOW}Checking system health...${NC}"
    curl -s http://localhost:5000/api/health
    echo -e "\n"
else
    echo -e "\n${GREEN}Setup complete! To start the services, run:${NC}"
    echo -e "docker-compose up -d"
fi

echo -e "\n${BLUE}=========================================${NC}"
echo -e "${BLUE}   Setup Completed Successfully!         ${NC}"
echo -e "${BLUE}=========================================${NC}"

echo -e "\n${YELLOW}System Optimization Tips:${NC}"
echo -e "1. Adjust cache TTL in .env for optimal performance"
echo -e "2. Monitor system metrics in Grafana dashboard"
echo -e "3. Check /api/health endpoint regularly for system status"
echo -e "4. Review logs in the logs/ directory for troubleshooting"
echo -e "5. Adjust database connection pool sizes based on load"
