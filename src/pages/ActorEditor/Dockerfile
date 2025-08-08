# Sử dụng base image của Apify cho Node.js
FROM apify/actor-node:18

# Thiết lập thư mục làm việc
WORKDIR /usr/src/app

# Copy package.json và package-lock.json (nếu có)
COPY package*.json ./

# Cài đặt dependencies
RUN npm ci --only=production

# Copy toàn bộ source code
COPY . ./

# Build ứng dụng (nếu cần)
RUN npm run build

# Expose port 8080
EXPOSE 8080

# Chạy ứng dụng
CMD [ "npm", "start" ]
