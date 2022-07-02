import dotenv from 'dotenv';

dotenv.config();

export const config = {
	port: process.env.PORT || 3000,
	NODE_ENV: process.env.NODE_ENV || 'development',
	JWT_SECRET: process.env.JWT_SECRET || '',
	CORS_ORIGIN: 'http://localhost:' + (process.env.PORT || 3000),
	COOKIE_DOMAIN: 'localhost',
	DB_URL: process.env.DATABASE_URL,
	DB_PASSWORD: 'MarwaHind123',
	DB_NAME: 'LPDB',
	DB_USER: 'postgres',
	DB_PORT: 5432
};
