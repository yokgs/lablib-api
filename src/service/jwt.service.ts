import jwt, { SignOptions } from 'jsonwebtoken';
import crypto from 'crypto';
import { config } from '../config/env.config';
import { IPayload } from '../types/jwtpayload.interface';
import { IPasswordPayload } from '../types/passwordpayload.interface';
import { IUser } from '../types/user.interface';

class JwtService {
	constructor(private readonly options?: SignOptions) { }

	public sign(payload: IPayload): string {
		return jwt.sign(payload, config.JWT_SECRET!, this.options);
	}
	public signUser(user: IUser): string {
		return jwt.sign(user, config.JWT_SECRET!, this.options);
	}
	public signPassword(password: IPasswordPayload): string {
		return jwt.sign(password, config.JWT_SECRET!, {
			expiresIn: '15min'
		});
	}
	public signInvitation(user: IUser): string {
		return jwt.sign(user, config.JWT_SECRET!, {
			expiresIn: '30d',
		});
	}

	public verify(token: string): IPayload {
		return jwt.verify(token, config.JWT_SECRET!, this.options) as IPayload;
	}
	public verifyAccount(token: string): IUser {
		return jwt.verify(token, config.JWT_SECRET!, this.options) as IUser;
	}
	public verifyPassword(token: string): IPasswordPayload {
		return jwt.verify(token, config.JWT_SECRET!, this.options) as IPasswordPayload;
	}
	public signRefreshToken(payload: IPayload): string {
		return jwt.sign(payload, config.JWT_SECRET!, {
			...this.options,
			expiresIn: '90d',
		});
	}

	public getOTP(token: string): string {
		let data = token + '.' + Math.floor(new Date().getTime() / 1000 / 60 / 3);
		let hash = crypto.createHash('sha256').update(data).digest('hex').slice(0,5);
		return parseInt(hash, 16).toString().slice(0, 6);
	}
}

export default new JwtService({
	expiresIn: '1d',
});
