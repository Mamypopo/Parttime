FROM node:18-alpine

WORKDIR /app

# ติดตั้ง dependencies
RUN apk add --no-cache make gcc g++ python3 openssl

# Copy package files และ prisma
COPY package*.json ./
COPY prisma ./prisma/

# ติดตั้ง dependencies
RUN npm install

# Copy source code
COPY . .

# Generate Prisma Client และ migrate
RUN npx prisma generate

# Rebuild bcrypt
RUN npm rebuild bcrypt --build-from-source

# For file uploads
RUN mkdir -p uploads/admin-profiles
RUN chmod 777 uploads/admin-profiles

EXPOSE 8000

# เพิ่ม script สำหรับ migrate และ start
COPY docker-entrypoint.sh /
RUN chmod +x /docker-entrypoint.sh

ENTRYPOINT ["/docker-entrypoint.sh"]