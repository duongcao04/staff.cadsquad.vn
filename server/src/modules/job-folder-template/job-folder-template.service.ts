import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../providers/prisma/prisma.service'
import { JobFolderTemplate } from '../../generated/prisma'
import { plainToInstance } from 'class-transformer'
import { CreateJobFolderTemplateDto } from './dto/create-job-folder-template.dto'
import { UpdateJobFolderTemplateDto } from './dto/update-job-folder-template.dto'
import { JobFolderTemplateResponseDto } from './dto/job-folder-template-response.dto'

@Injectable()
export class JobFolderTemplateService {
  constructor(private readonly prismaService: PrismaService) { }

  async create(data: CreateJobFolderTemplateDto): Promise<JobFolderTemplate> {
    const jobFolderTemplate = await this.prismaService.jobFolderTemplate.create({ data })
    return plainToInstance(JobFolderTemplateResponseDto, jobFolderTemplate, { excludeExtraneousValues: true }) as unknown as JobFolderTemplate
  }

  async findAll(): Promise<JobFolderTemplate[]> {
    const jobFolderTemplates = await this.prismaService.jobFolderTemplate.findMany()
    return jobFolderTemplates.map(jft => plainToInstance(JobFolderTemplateResponseDto, jft, { excludeExtraneousValues: true })) as unknown as JobFolderTemplate[]
  }

  async findById(id: string): Promise<JobFolderTemplate> {
    const jobFolderTemplate = await this.prismaService.jobFolderTemplate.findUnique({ where: { id } })
    if (!jobFolderTemplate) throw new NotFoundException('Job folder template not found')
    return plainToInstance(JobFolderTemplateResponseDto, jobFolderTemplate, { excludeExtraneousValues: true }) as unknown as JobFolderTemplate
  }

  async update(id: string, data: UpdateJobFolderTemplateDto): Promise<JobFolderTemplate> {
    try {
      const updated = await this.prismaService.jobFolderTemplate.update({ where: { id }, data })
      return plainToInstance(JobFolderTemplateResponseDto, updated, { excludeExtraneousValues: true }) as unknown as JobFolderTemplate
    } catch (error) {
      throw new NotFoundException('Job folder template not found')
    }
  }

  async delete(id: string): Promise<JobFolderTemplate> {
    try {
      return await this.prismaService.jobFolderTemplate.delete({ where: { id } })
    } catch (error) {
      throw new NotFoundException('Job folder template not found')
    }
  }
}