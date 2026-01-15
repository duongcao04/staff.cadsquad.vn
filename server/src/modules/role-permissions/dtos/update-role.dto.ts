import { PartialType } from '@nestjs/mapped-types'; // or @nestjs/swagger
import { CreateRoleDto } from './create-role.dto';

export class UpdateRoleDto extends PartialType(CreateRoleDto) {}