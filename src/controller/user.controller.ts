import { Request, Response } from 'express';
import moment from 'moment';
import { BadRequestException } from '../error/BadRequestException.error';
import { User } from '../model/user';
import userService from '../service/user.service';
import jwtService from '../service/jwt.service';
import passwordService from '../service/password.service';
import { Role } from '../types/role.enum';
import { Controller, Get, Post, Put } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { NotFoundException } from '../error/NotFoundException.error';
import { info } from 'console';
import { token } from 'morgan';


@ApiTags('User')
@Controller('api/v1/user')
export class UserController {
	@Get('/me')
	public async currentUser(req: Request, res: Response) {
		res.status(200).json(req.currentUser);
	}

	@Get('/')
	public async allUsers(req: Request, res: Response) {
		res.status(200).json((await userService.getAll()).map((user) => ({ ...user, password: undefined })));
	}

	@Post('/')
	public async create(req: Request, res: Response) {
		const { email, password, firstName, lastName } = req.body;

		if (!email || !password || !firstName || !lastName) {
			throw new BadRequestException('Missing required fields');
		}

		if (await userService.getByEmail(email)) {
			throw new BadRequestException('Email already exists');
		}

		const user = new User();

		user.email = email;
		user.password = await passwordService.hashPassword(password);
		user.firstName = firstName;
		user.lastName = lastName;

		const newUser = await userService.create(user);

		// sign user interface and send it to the email

		res.status(200).json({ ...newUser, password: undefined });
	}

	@Get('/verify/:token')
	public async verifyEmail(req: Request, res: Response) {
		let { token } = req.params;
		try {
			let body = jwtService.verify(token);

		} catch (err) {
			throw new BadRequestException('Invalid token');
		}
	}
	@Get('/:userId')
	public async userById(req: Request, res: Response) {
		const userId = Number(req.params.userId);

		res.status(200).json({ ...await userService.getById(userId), password: undefined });
	}

	@Post('/login')
	public async login(req: Request, res: Response) {
		const { login, password } = req.body;

		const user = await userService.getByEmail(login);

		if (!user) {
			throw new BadRequestException('Invalid credentials');
		}

		const isPasswordValid = await passwordService.comparePassword(
			password,
			user.password
		);

		if (!isPasswordValid) {
			throw new BadRequestException('Invalid credentials');
		}

		req.session.access_token = jwtService.sign({
			userId: user.id,
			role: Role.ADMIN,
		});

		req.sessionOptions.expires = moment().add(1, 'day').toDate();

		res.status(200).json({ ...user, password: undefined });
	}
	@Post('/logout')
	public async logout(req: Request, res: Response) {
		req.session.access_token = undefined;

		res.status(200).json();
	}
	@Get('/me/details')
	public async details(req: Request, res: Response) {
		const user = await userService.getById(req.currentUser?.userId!);

		const userNoPassword = { ...user, password: undefined };


		res.status(200).json(userNoPassword);
	}
	
	@Put('/:userId')
	public async update(req: Request, res: Response) {
		const { userId } = req.params;
		if( Number(userId) === req.currentUser.userId ) res.redirect('')
		const { email, firstName, lastName } = req.body;

		const user = await userService.getById(Number(userId));

		if (!user) {
			throw new NotFoundException('User not found');
		}

		if (!email || !firstName || !lastName) {
			throw new BadRequestException('Missing required fields');
		}

		user.email = email;
		user.firstName = firstName;
		user.lastName = lastName;

		const updatedUser = await userService.update(Number(userId), user);

		return res.status(200).json({ ...updatedUser, password: undefined });
	}
	@Put('/:userId/promote')
	public async promote(req: Request, res: Response) {
		const { userId } = req.params;
		const user = await userService.getById(Number(userId));

		if (!user) {
			throw new NotFoundException('User not found');
		}

		user.role = Role.ADMIN;
		const updatedUser = await userService.update(Number(userId), user);

		return res.status(200).json({ ...updatedUser, password: undefined });
	}
	@Put('/:userId/demote')
	public async demote(req: Request, res: Response) {
		const { userId } = req.params;
		const user = await userService.getById(Number(userId));

		if (!user) {
			throw new NotFoundException('User not found');
		}

		user.role = Role.USER;
		const updatedUser = await userService.update(Number(userId), user);

		return res.status(200).json({ ...updatedUser, password: undefined });
	}

	@Get('/role/admin')
	public async getRoleAdmin(req: Request, res: Response) {
		res.status(200).json((await userService.getAll()).map((user) => ({ ...user, password: undefined })).filter(x => (x.role === Role.ADMIN)));
	}

	@Get('/role/user')
	public async getRoleUser(req: Request, res: Response) {
		res.status(200).json((await userService.getAll()).map((user) => ({ ...user, password: undefined })).filter(x => (x.role === Role.USER)));
	}
	@Put('/me')
	public async updateCurrentUser(req: Request, res: Response) {
		const { email, firstName, lastName, password, currentPassword } = req.body;
		const user = await userService.getById(req.currentUser.userId);
		user.firstName = firstName || user.firstName;
		user.lastName = lastName || user.lastName;
		if (email) {
			user.email = email;
			//sign new email address with user id and send it to the email
		}
		const updatedUser = await userService.update(req.currentUser.userId, user);
		return res.status(200).json({ ...updatedUser, password: undefined });
	}

}

export default new UserController();
