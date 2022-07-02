import { Role } from './role.enum';

export interface IPayload {
	userId: number;
	role: Role;
}
