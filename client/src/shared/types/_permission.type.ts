import { EntityEnum } from "../enums";
import { TRole } from "./_role.type";

export interface TPermission {
	id: string;
	displayName: string;
	code: string;
	entity: EntityEnum;
	action: string;
	entityAction: string;
	description?: string;
	roles: TRole[];

	createdAt: string | Date
	updatedAt: string | Date
}

export type TGroupPermission = {
	id: string
	name: string
	code: string
	permissions: TPermission[]
}
