FROM node:20-alpine as build

WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json* ./
RUN npm ci

# Copy the rest of the application
COPY . .

# Build the application
RUN npm run build:prod

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install production dependencies only
RUN npm ci --production

# Copy build output from build stage
COPY --from=build /app/build ./build
COPY --from=build /app/public ./public

# Expose the port the app runs on
EXPOSE 3000

# Command to run the application
CMD ["npm", "start"] 