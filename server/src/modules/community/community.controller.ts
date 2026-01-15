import {
    Controller,
    Get,
    Param,
    Post,
    Query,
    Req,
    UseGuards,
} from '@nestjs/common'
import { ResponseMessage } from '../../common/decorators/responseMessage.decorator'
import { JwtGuard } from '../auth/jwt.guard'
import { CommunityService } from './community.service'

@Controller('communities')
@UseGuards(JwtGuard)
export class CommunityController {
    constructor(private readonly communityService: CommunityService) {}

    @Get()
    async findAll(@Req() req) {
        return this.communityService.findAll(req.user.id)
    }

    @Get(':code')
    async findByCode(@Param('code') code: string) {
        return this.communityService.findByCode(code)
    }

    @Post(':id/join')
    async join(@Param('id') communityId: string, @Req() req) {
        return this.communityService.joinCommunity(req.user.id, communityId)
    }

    @Get(':code/posts')
    @ResponseMessage('Get community posts successfully')
    async getCommunityPosts(
        @Param('code') code: string,
        @Query('page') page: string = '1',
        @Query('limit') limit: string = '20'
    ) {
        return this.communityService.findAllPostsByCommunity(
            code,
            Number(page),
            Number(limit)
        )
    }

    @Get(':code/topics')
    async getTopics(@Param('code') code: string) {
        return this.communityService.findTopicsByCommunity(code)
    }

    @Get(':code/topics/:topicCode')
    @ResponseMessage('Get topic details successfully')
    async getTopicDetails(
        @Param('code') code: string,
        @Param('topicCode') topicCode: string
    ) {
        return this.communityService.findTopicDetails(code, topicCode)
    }
}
