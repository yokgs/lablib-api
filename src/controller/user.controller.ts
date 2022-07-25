import { Request, Response } from 'express';
import moment, { duration } from 'moment';
import { BadRequestException } from '../error/BadRequestException.error';
import { User } from '../model/user';
import userService from '../service/user.service';
import jwtService from '../service/jwt.service';
import passwordService from '../service/password.service';
import { Role } from '../types/role.enum';
import { Controller, Delete, Get, Post, Put } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { NotFoundException } from '../error/NotFoundException.error';
import emailService from '../service/email.service';
import { IUser } from '../types/user.interface';
import htmlService from '../service/html.service';
import { config } from '../config/env.config';
import { IPasswordPayload } from '../types/passwordpayload.interface';
import path from 'path';
import { ImageEntity } from '../model/image';
import imageService from '../service/image.service';
import { PostUserDTO } from '../dto/post.user.dto';
import { PutUserDTO } from '../dto/put.user.dto';
import { LoginDTO } from '../dto/login.dto';

@ApiTags('User')
@Controller('api/v1/user')
export class UserController {

	@Get('/me')
	@ApiOperation({ description: 'get information about the current user (session)' })
	public async currentUser(req: Request, res: Response) {
		res.status(200).json(req.currentUser);
	}

	@Get('/')
	@ApiOperation({ description: 'get the list of all users' })
	public async allUsers(req: Request, res: Response) {
		res.status(200).json((await userService.getAll()).map((user) => ({
			...user,
			password: undefined,
			//active: req.currentUser.role == Role.ADMIN ? user.active : undefined,
			//createdAt: req.currentUser.role == Role.ADMIN ? user.createdAt : undefined,
			updatedAt: undefined
		})));
	}

	@Get('/active')
	@ApiOperation({ description: 'get the list of active users' })
	public async allActiveUsers(req: Request, res: Response) {
		res.status(200).json((await userService.getAll()).filter(x => {
			return (new Date()).getTime() - x.active.getTime() < 24 * 60 * 60 * 1000;
		}).map((user) => ({
			...user,
			password: undefined,
			//active: req.currentUser.role == Role.ADMIN ? user.active : undefined,
			//createdAt: req.currentUser.role == Role.ADMIN ? user.createdAt : undefined,
			updatedAt: undefined
		})));
	}

	@Get('/joined')
	@ApiOperation({ description: 'get the list of recently joined users' })
	public async allJoinedUsers(req: Request, res: Response) {
		res.status(200).json((await userService.getAll()).filter(x => {
			return (new Date()).getTime() - x.createdAt.getTime() < 24 * 60 * 60 * 1000;
		}).map((user) => ({
			...user,
			password: undefined,
			//active: req.currentUser.role == Role.ADMIN ? user.active : undefined,
			//createdAt: req.currentUser.role == Role.ADMIN ? user.createdAt : undefined,
			updatedAt: undefined
		})));
	}


	@Post('/')
	@ApiBody({
		type: PostUserDTO,
		description: 'user credentials',
	})
	@ApiOperation({ description: 'request an email verification link to create new user account', })
	public async create(req: Request, res: Response) {
		const { email, password, firstname, lastname } = req.body;

		if (!email || !password || !firstname || !lastname) {
			throw new BadRequestException('Missing required fields');
		}

		if (!/^[\w\-\.]+@[\w\-]+\.[\.a-z]+$/.test(email.trim().toLowerCase())) {
			throw new BadRequestException(`email ${email} must be a valid email address`);
		}

		if (password.length < 8 || /^[\w]+$/.test(password)) {
			throw new BadRequestException(`password must be at least 8 characters long with one special character at least`);
		}

		if (await userService.getByEmail(email)) {
			throw new BadRequestException('Email already exists');
		}

		let link = config.origin + 'api/v1/user/verify/' + jwtService.signUser({
			email,
			password: await passwordService.hashPassword(password),
			firstname, lastname
		});
		await emailService.sendMail(
			htmlService.createLink(link, 'Verify your account'),
			email,
			'Verify your LabLib registration');
		res.status(200).json({ message: "email sent" });
	}

	@Get('/verify/:token')
	@ApiOperation({ description: 'create a new user account after the verification process has completed' })
	public async verifyEmail(req: Request, res: Response) {
		let { token } = req.params, body: IUser;
		try {
			body = jwtService.verifyAccount(token);
		} catch (err) {
			throw new BadRequestException('Invalid token');
		}
		if (await userService.getByEmail(body.email)) {
			throw new BadRequestException('Email is already verified');
		}
		const user = new User();
		user.email = body.email;
		user.password = body.password;
		user.firstname = body.firstname;
		user.lastname = body.lastname;

		if (req.files && req.files.image) {
			let image = req.files.image;
			const newImage = new ImageEntity();
			newImage.content = image.data;
			let $image = await imageService.create(newImage);
			user.image = $image.id;
		}

		const newUser = await userService.create(user);
		res.status(201).json({ ...newUser, password: undefined });
	}

	@Get('/resetpassword')
	@ApiOperation({ description: 'request a reset password link to be sent to your mailbox' })
	public async resetPassword(req: Request, res: Response) {
		const { email } = req.body;
		if (!email) throw new BadRequestException('Invalid email address :' + email);
		const user = await userService.getByEmail(email);
		if (!user) {
			throw new NotFoundException('User not found');
		}
		let link = config.origin + 'api/v1/user/resetpassword/' + jwtService.signPassword({ userId: user.id, key: user.password } as IPasswordPayload);
		emailService.sendMail(
			htmlService.createLink(link, 'click to reset your password'),
			user.email,
			'Reset Your LabLib Password');
		return res.status(200).json({ message: 'email sent' });
	}

	@Get('/resetpassword/:token')
	@ApiOperation({ description: '(expirimental feature) get access to reset your password' })
	public async resetPasswordPage(req: Request, res: Response) {
		let { token } = req.params, body: IPasswordPayload;
		try {
			body = jwtService.verifyPassword(token);

		} catch (err) {
			throw new BadRequestException('Invalid token');
		}

		let { userId } = body;
		const user = await userService.getById(userId);
		if (!user) {
			throw new NotFoundException('User not found');
		}
		res.status(200).sendFile(path.join(__dirname, '../../static/passwordreset.html'));
	}

	@Post('/resetpassword/:token')
	@ApiOperation({ description: 'request to change password via link sent to the email' })
	public async getPassword(req: Request, res: Response) {
		let { password } = req.body;
		let { token } = req.params, body: IPasswordPayload;
		try {
			body = jwtService.verifyPassword(token);

		} catch (err) {
			throw new BadRequestException('Invalid token');
		}

		let { userId } = body;
		const user = await userService.getById(userId);
		if (!user) {
			throw new NotFoundException('User not found');
		}
		user.password = await passwordService.hashPassword(password);
		await userService.update(userId, user);
		res.status(200).json({ message: "password updated successfully" });
	}

	@Get('/:userId')
	@ApiOperation({ description: 'get information about a specific user' })
	public async userById(req: Request, res: Response) {
		const userId = Number(req.params.userId);
		res.status(200).json({ ...await userService.getById(userId), password: undefined });
	}

	@Post('/login')
	@ApiBody({
		type: LoginDTO,
		description: 'informations to authenticate user',
	})
	@ApiOperation({ description: 'authentication as a specific user' })
	public async login(req: Request, res: Response) {
		const { email, password } = req.body;

		const user = await userService.getByEmail(email);

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
		/*const token = jwtService.sign({
			userId: user.id,
			role: user.role as Role
		});
		res.cookie("Authorization", "Bearer " + token, {
			httpOnly: true,
			maxAge: 3600000,
			sameSite: "none",
			secure: true,
		});*/
		user.active = new Date();
		await userService.update(user.id, user);
		res.status(200).json({ ...user, password: undefined });
	}

	@Post('/logout')
	@ApiOperation({ description: 'close the session' })
	public async logout(req: Request, res: Response) {
		req.session.access_token = undefined;
		res.status(200).json();
	}
	@Get('/me/details')
	@ApiOperation({ description: 'get detailed informations about the current user' })
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
	@ApiBody({
		type: PutUserDTO,
		description: 'infos to be updated',
	})
	@ApiOperation({ description: 'update information about the current user' })
	public async updateCurrentUser(req: Request, res: Response) {
		const { email, firstname, lastname, password, currentPassword } = req.body;
		const user = await userService.getById(req.currentUser.userId);

		let isPasswordValid = await passwordService.comparePassword(currentPassword, user.password);
		if (!isPasswordValid) {
			throw new BadRequestException('Invalid password');
		}

		firstname && (user.firstname = firstname);
		lastname && (user.lastname = lastname);

		if (email && user.email != email) {
			if (!/^[\w\-\.]+@[\w\-]+\.[\.a-z]+$/.test(email.trim().toLowerCase())) {
				throw new BadRequestException(`email ${email} must be a valid email address`);
			}

			let isUsed = await userService.getByEmail(email);
			if (isUsed) throw new BadRequestException('Email already in use');
			user.email = email;

			//sign new email address with user id and send it to the email
		}
		if (password) {
			if (password.length < 8 || /^[\w]+$/.test(password))
				throw new BadRequestException(`password must be at least 8 characters long with one special character at least`);
			user.password = await passwordService.hashPassword(password);
		}

		if (req.files && req.files.image) {
			let image = req.files.image;
			await imageService.delete(user.image);
			const newImage = new ImageEntity();
			newImage.content = image.data;
			let $image = await imageService.create(newImage);
			user.image = $image.id;
		}

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

	@Get('/test/otp')
	@ApiOperation({ description: '(expirimensional feature) generate OneTimePassword' })
	public async getOTP(req: Request, res: Response) {
		let d = 30;
		res.status(200).json({
			resetIn: (d - ((new Date()).getTime() % (d * 1000)) / 1000) + 's',
			otp_prev: jwtService.getOTP(req.body.key || 'test', 30, -15),
			otp: jwtService.getOTP(req.body.key || 'test', 30, 0),
			otp_next: jwtService.getOTP(req.body.key || 'test', 30, 15)

		})
	}
}

export default new UserController();
