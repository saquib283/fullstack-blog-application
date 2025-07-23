# FROM node:20

# WORKDIR /app-frontend

# COPY package.json package-lock.json* ./
# RUN npm install

# COPY . .

# Expose 3000

# CMD ["npm", "run", "dev"]



# Use Node 20+ (Next 15 needs Node 18+)
FROM node:20

# Set working directory
WORKDIR /app-frontend

# Install dependencies first
COPY package*.json ./
RUN npm install

# The rest of your code comes from the bind mount in docker-compose

# Expose port
EXPOSE 3000

# Start dev server
CMD ["npm", "run", "dev"]
