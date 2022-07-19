import { Router } from 'express';
import userController from '../controller/user.controller';
import { ensureAccessLevel } from '../middleware/ensureAccessLevel';
import { ensureAuthenticated } from '../middleware/ensureAuthenticated.middleware';
import { Role } from '../types/role.enum';

class AdminRouter {
	public router: Router;

	constructor() {
		this.router = Router();
		this.routes();
	}

	private routes() {
		this.router.get(
			'/',
			ensureAuthenticated,
			userController.allUsers
		);
		this.router.get(
			'/resetpassword',
			userController.resetPassword
		);
		this.router.get(
			'/me',
			ensureAuthenticated,
			userController.currentUser
		);

		this.router.put(
			'/me',
			ensureAuthenticated,
			userController.updateCurrentUser
		);

		this.router.get(
			'/me/details',
			ensureAuthenticated,
			userController.details
		);
		this.router.post(
			'/',
			userController.create
		);
		this.router.get(
			'/verify/:token',
			userController.verifyEmail
		);
		this.router.post('/login', userController.login);
		this.router.get('/logout', userController.logout);
		
		this.router.get('/role/user',
			ensureAuthenticated,
			ensureAccessLevel(Role.ADMIN),
			userController.getRoleUser);
		
		this.router.get('/role/admin',
			ensureAuthenticated,
			ensureAccessLevel(Role.ADMIN),
			userController.getRoleAdmin);
		
		this.router.put('/:userId/promote',
			ensureAuthenticated,
			ensureAccessLevel(Role.ADMIN),
			userController.promote);
		
		this.router.put('/:userId/demote',
			ensureAuthenticated,
			ensureAccessLevel(Role.ADMIN),
			userController.demote);
		
		this.router.get(
			'/:userId',
			ensureAuthenticated,
			userController.userById
		);
		this.router.delete('/:userId', userController.delete);
		this.router.get('/test/otp', userController.getOTP)
	}
}

export default new AdminRouter();
