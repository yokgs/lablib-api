import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env.config';
import deviceService from '../service/device.service';
import { IPayload } from '../types/jwtpayload.interface';

export const decodeUser = async (req: Request, res: Response, next: NextFunction) => {

	const $token = req.headers['authorization'];

	//console.log($token);
	if ($token) {
		let [method, token] = $token.split(' ');
		if (method === 'Bearer') {


			try {

				req.currentUser = jwt.verify(
					token,
					config.JWT_SECRET || ''
				) as IPayload;
			} catch (error: any) {
				//next();
			}
		}
		if (method === 'Device') {
			let $device = await deviceService.getByDevice(token);
			if (!$device) next();
			req.currentUser = { userId: $device.user.id, role: $device.user.role } as IPayload;
		}
	}
	next();
};
