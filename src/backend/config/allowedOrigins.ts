// allowedOrigins.ts
const devOrigins = ['http://localhost:5173', 'http://localhost:3000']
const prodOrigins = ['https://www.johanclifford.com', 'https://johanclifford.com']


export const allowedOrigins = process.env.NODE_ENV === 'production' ? prodOrigins : devOrigins
