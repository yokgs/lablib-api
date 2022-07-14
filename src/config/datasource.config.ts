import { DataSource } from 'typeorm';
import { User } from '../model/user';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { config } from './env.config';
import { Lab } from '../model/lab';
import { Category } from '../model/category';
import { Course } from '../model/course';
import { Chapter } from '../model/chapter';
import { Step } from '../model/step';
import { ImageEntity } from '../model/image';


const PostgresDataSource = new DataSource({
	name: 'default',
	type: 'postgres',
	url: config.DB_URL,
	entities: [User, Lab, Category, Course, Chapter, Step, ImageEntity],
	ssl: config.NODE_ENV == 'development' ? undefined : {
		rejectUnauthorized: false
	},
	namingStrategy: new SnakeNamingStrategy(),
});

export { PostgresDataSource };