import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env.config';
import deviceService from '../service/device.service';
import { IPayload } from '../types/jwtpayload.interface';

export const decodeUser = async (req: Request, res: Response, next: NextFunction) => {

	const $token = req.headers['Authorization']?.toString();
	console.log($token);
	if ($token) {
		try {
			req.currentUser = jwt.verify(
				$token,
				config.JWT_SECRET || ''
			) as IPayload;
		} catch (error: any) {
			//next();
		}
	}
	if (req.body?.device) {
		let { device } = req.body;
		let $device = await deviceService.getByDevice(device);
		if (!$device) next();
		req.currentUser = { userId: $device.user.id, role: $device.user.role } as IPayload;
	}
	next();
};
