import { DeleteResult, Repository } from 'typeorm';
import { PostgresDataSource } from '../config/datasource.config';
import { Category } from '../model/category';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CategoryService {

	private categoryRepository: Repository<Category>;

	constructor() {
		this.categoryRepository = PostgresDataSource.getRepository(Category);
	}

	public async update(categoryId: number, category: Category) {
		return this.categoryRepository.save({ ...category, id: categoryId });
	}
	public async getAll(): Promise<Category[]> {
		return this.categoryRepository.find({
			relations:['courses']
		});
	}

	public async getById(id: number): Promise<Category | null> {
		return this.categoryRepository.findOne({ where: { id }, relations: ['courses'] });
	}

	public async create(category: Category): Promise<Category> {
		return this.categoryRepository.save(category);
	}
	public async delete(id: number): Promise<DeleteResult> {
		return this.categoryRepository.delete({ id });
	}

	public async getByName(name: string): Promise<Category | null> {
		return this.categoryRepository.findOne({ where: { name }, relations: ['courses'] });
	}
	
}
export default new CategoryService();