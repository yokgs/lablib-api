import { DeleteResult, Repository } from 'typeorm';
import { PostgresDataSource } from '../config/datasource.config';
import { Category } from '../model/category';

class CategoryService {

	private categoryRepository: Repository<Category>;

	constructor() {
		this.categoryRepository = PostgresDataSource.getRepository(Category);
	}

	public async update(categoryId: number, category: Category) {
		return this.categoryRepository.save({ ...category, id: categoryId });
	}
	public async getAll(): Promise<Category[]> {
		return this.categoryRepository.find();
	}

	public async getById(id: number): Promise<Category | null> {
		return this.categoryRepository.findOne({ where: { id } });
	}

	public async create(category: Category): Promise<Category> {
		let save: Promise<Category>;
		try {
			save = this.categoryRepository.save(category);
		} catch (err) {
			console.error(err);
		}
		return save;
		
	}
	public async delete(id: number): Promise<DeleteResult> {
        return this.categoryRepository.delete({ id });
    }

	public async getByName(name: string): Promise<Category | null> {
		return this.categoryRepository.findOneBy({ name });
	}
}

export default new CategoryService();
