FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json .npmrc ./
RUN npm ci

COPY . .

# Vite inlines VITE_* variables at build time. The URL is used by the browser,
# so it points at the backend port published on the host.
ARG VITE_API_URL=http://localhost:5001
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

EXPOSE 5173

CMD ["npx", "vite", "preview", "--host", "0.0.0.0", "--port", "5173", "--strictPort"]
