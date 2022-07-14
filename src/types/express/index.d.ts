declare namespace Express {
	export interface Request {
		currentUser?: {
			userId: number;
			role: number;
		};
		session: {
			access_token?: string;
		};
		files?: any;
	}
}
