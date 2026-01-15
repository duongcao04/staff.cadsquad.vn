import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../providers/prisma/prisma.service'
import { Department } from '../../generated/prisma'
import { plainToInstance } from 'class-transformer'
import { CreateDepartmentDto } from './dto/create-department.dto'
import { UpdateDepartmentDto } from './dto/update-department.dto'
import { DepartmentResponseDto } from './dto/department-response.dto'

@Injectable()
export class DepartmentService {
    constructor(private readonly prismaService: PrismaService) {}

    async create(data: CreateDepartmentDto): Promise<Department> {
        const department = await this.prismaService.department.create({ data })
        return plainToInstance(DepartmentResponseDto, department, {
            excludeExtraneousValues: true,
        }) as unknown as Department
    }

    async findAll(): Promise<Department[]> {
        const departments = await this.prismaService.department.findMany({
            include: { _count: { select: { users: true } }, users: true },
        })
        return departments.map((d) =>
            plainToInstance(DepartmentResponseDto, d, {
                excludeExtraneousValues: true,
            })
        ) as unknown as Department[]
    }

    async findById(id: string): Promise<Department> {
        const department = await this.prismaService.department.findUnique({
            where: { id },
            include: { _count: { select: { users: true } }, users: true },
        })
        if (!department) throw new NotFoundException('Department not found')
        return plainToInstance(DepartmentResponseDto, department, {
            excludeExtraneousValues: true,
        }) as unknown as Department
    }

    async findByCode(code: string): Promise<Department> {
        const department = await this.prismaService.department.findUnique({
            where: { code },
            include: { _count: { select: { users: true } }, users: true },
        })
        if (!department) throw new NotFoundException('Department not found')
        return plainToInstance(DepartmentResponseDto, department, {
            excludeExtraneousValues: true,
        }) as unknown as Department
    }

    async update(id: string, data: UpdateDepartmentDto): Promise<Department> {
        try {
            const updated = await this.prismaService.department.update({
                where: { id },
                data,
            })
            return plainToInstance(DepartmentResponseDto, updated, {
                excludeExtraneousValues: true,
            }) as unknown as Department
        } catch (error) {
            throw new NotFoundException('Department not found')
        }
    }

    async delete(id: string): Promise<Department> {
        try {
            return await this.prismaService.department.delete({ where: { id } })
        } catch (error) {
            throw new NotFoundException('Department not found')
        }
    }
}
