import { Request, Response } from 'express';
import moment from 'moment';
import { BadRequestException } from '../error/BadRequestException.error';
import { User } from '../model/user';
import userService from '../service/user.service';
import jwtService from '../service/jwt.service';
import passwordService from '../service/password.service';
import { Role } from '../types/role.enum';
import { Controller, Delete, Get, Post, Put } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { NotFoundException } from '../error/NotFoundException.error';
import { info } from 'console';
import { token } from 'morgan';
import emailService from '../service/email.service';
import { IUser } from '../types/user.interface';
import { Not } from 'typeorm';
import htmlService from '../service/html.service';
import { sign } from 'crypto';
import { config } from '../config/env.config';


@ApiTags('User')
@Controller('api/v1/user')
export class UserController {
	@Get('/me')
	public async currentUser(req: Request, res: Response) {
		res.status(200).json(req.currentUser);
	}

	@Get('/')
	public async allUsers(req: Request, res: Response) {
		res.status(200).json((await userService.getAll()).map((user) => ({
			...user,
			password: undefined,
			active: req.currentUser.role == Role.ADMIN ? user.active : undefined,
			createdAt: req.currentUser.role == Role.ADMIN ? user.createdAt : undefined,
			updatedAt: undefined
		})));
	}

	@Post('/')
	public async create(req: Request, res: Response) {
		const { email, password, firstname, lastname } = req.body;

		if (!email || !password || !firstname || !lastname) {
			throw new BadRequestException('Missing required fields');
		}

		if (await userService.getByEmail(email)) {
			throw new BadRequestException('Email already exists');
		}

		// sign user interface and send it to the email
		let data = '<a href="https://labib-api.heroku.com/api/v1/user/verify/' + jwtService.signUser({
			email,
			password: await passwordService.hashPassword(password),
			firstname, lastname
		}) + '">verify your account</a>';
		emailService.sendMail(data, email, 'verify email');
		res.status(200).json({ message: "email sent" });
	}

	@Get('/verify/:token')
	public async verifyEmail(req: Request, res: Response) {
		let { token } = req.params, body: IUser;
		try {
			body = jwtService.verifyAccount(token);

		} catch (err) {
			throw new BadRequestException('Invalid token');
		}
		const user = new User();
		user.email = body.email;
		user.password = body.password;
		user.firstname = body.firstname;
		user.lastname = body.lastname;
		const newUser = await userService.create(user);
		res.status(201).json({ ...newUser, password: undefined });
	}

	@Get('/resetpassword')
	public async resetPassword(req: Request, res: Response) {
		const { email } = req.body;
		if (!email) throw new BadRequestException('Invalid email address :' + email);
		const user = await userService.getByEmail(email);
		if (!user) {
			throw new NotFoundException('User not found');
		}
		let link = config.origin+'api/v1/user/resetpassword/'+jwtService.signUser({ ...user, password: undefined} as IUser);
		emailService.sendMail(
			htmlService.createLink(link, 'click to reset your password'),
			user.email,
			'Reset Password');
		return res.status(200).json({ message:'email sent' });
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
			role: user.role as Role
		});

		req.sessionOptions.expires = moment().add(1, 'day').toDate();
		user.active = new Date();
		await userService.update(user.id, user);
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
		const { email, firstname, lastname, password, currentPassword } = req.body;
		const user = await userService.getById(req.currentUser.userId);
		user.firstname = firstname || user.firstname;
		user.lastname = lastname || user.lastname;
		if (email) {
			user.email = email;
			//sign new email address with user id and send it to the email
		}
		if (password)
			user.password = await passwordService.hashPassword(password);
		const updatedUser = await userService.update(req.currentUser.userId, user);
		return res.status(200).json({ ...updatedUser, password: undefined });
	}

	@Delete('/:userId')
	public async delete(req: Request, res: Response) {
		const { userId } = req.params;
		console.log('delete user', userId);
		const user = await userService.getById(Number(userId));
		console.log('delete user', user);

		if (!user)
			throw new NotFoundException('User not found');

		await userService.delete(Number(userId));

		return res.status(200).json({});
	}
}

export default new UserController();
