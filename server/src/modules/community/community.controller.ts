import {
    Controller,
    Get,
    HttpCode,
    Param,
    Post,
    Query,
    Req,
    UseGuards,
} from '@nestjs/common'
import {
    ApiBearerAuth,
    ApiOperation,
    ApiParam,
    ApiQuery,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger'
import { ResponseMessage } from '../../common/decorators/responseMessage.decorator'
import { NotFoundResponseDto, UnauthorizedResponseDto } from '../../common/swagger/api-response.dto'
import { JwtGuard } from '../auth/jwt.guard'
import { CommunityService } from './community.service'

@ApiTags('Communities')
@ApiBearerAuth()
@Controller('communities')
@UseGuards(JwtGuard)
export class CommunityController {
    constructor(private readonly communityService: CommunityService) {}

    @Get()
    @HttpCode(200)
    @ApiOperation({
        summary: 'Lấy danh sách tất cả cộng đồng',
        description: 'Trả về danh sách communities user có thể tham gia hoặc đã join.',
    })
    @ApiResponse({
        status: 200,
        description: 'Danh sách cộng đồng',
        schema: {
            example: {
                result: [{ id: 'uuid', name: 'Design Team', code: 'design-team', memberCount: 12 }],
            },
        },
    })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    async findAll(@Req() req) {
        return this.communityService.findAll(req.user.id)
    }

    @Get(':code')
    @HttpCode(200)
    @ApiOperation({
        summary: 'Lấy chi tiết cộng đồng theo code',
        description: 'Trả về thông tin cộng đồng và metadata. `code` là slug định danh (VD: design-team).',
    })
    @ApiParam({ name: 'code', description: 'Slug code của cộng đồng', example: 'design-team' })
    @ApiResponse({ status: 200, description: 'Chi tiết cộng đồng' })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    @ApiResponse({ status: 404, type: NotFoundResponseDto })
    async findByCode(@Param('code') code: string) {
        return this.communityService.findByCode(code)
    }

    @Post(':id/join')
    @HttpCode(200)
    @ApiOperation({
        summary: 'Tham gia một cộng đồng',
        description: 'User hiện tại xin tham gia cộng đồng theo ID.',
    })
    @ApiParam({ name: 'id', description: 'UUID của cộng đồng muốn join', example: 'uuid-of-community' })
    @ApiResponse({ status: 200, description: 'Đã tham gia cộng đồng thành công' })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    @ApiResponse({ status: 404, type: NotFoundResponseDto })
    async join(@Param('id') communityId: string, @Req() req) {
        return this.communityService.joinCommunity(req.user.id, communityId)
    }

    @Get(':code/posts')
    @HttpCode(200)
    @ResponseMessage('Get community posts successfully')
    @ApiOperation({
        summary: 'Lấy danh sách bài đăng của cộng đồng',
        description: 'Trả về danh sách bài viết trong cộng đồng, hỗ trợ phân trang.',
    })
    @ApiParam({ name: 'code', description: 'Slug code của cộng đồng', example: 'design-team' })
    @ApiQuery({ name: 'page', required: false, description: 'Trang hiện tại (mặc định: 1)', example: 1 })
    @ApiQuery({ name: 'limit', required: false, description: 'Số bài mỗi trang (mặc định: 20)', example: 20 })
    @ApiResponse({ status: 200, description: 'Danh sách bài đăng' })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    async getCommunityPosts(
        @Param('code') code: string,
        @Query('page') page: string = '1',
        @Query('limit') limit: string = '20'
    ) {
        return this.communityService.findAllPostsByCommunity(code, Number(page), Number(limit))
    }

    @Get(':code/topics')
    @HttpCode(200)
    @ApiOperation({
        summary: 'Lấy danh sách chủ đề của cộng đồng',
        description: 'Trả về tất cả topics trong cộng đồng để phân loại bài đăng.',
    })
    @ApiParam({ name: 'code', description: 'Slug code của cộng đồng', example: 'design-team' })
    @ApiResponse({ status: 200, description: 'Danh sách topics' })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    async getTopics(@Param('code') code: string) {
        return this.communityService.findTopicsByCommunity(code)
    }

    @Get(':code/topics/:topicCode')
    @HttpCode(200)
    @ResponseMessage('Get topic details successfully')
    @ApiOperation({
        summary: 'Lấy chi tiết một chủ đề',
        description: 'Trả về thông tin topic và danh sách bài đăng thuộc topic đó.',
    })
    @ApiParam({ name: 'code', description: 'Slug code của cộng đồng', example: 'design-team' })
    @ApiParam({ name: 'topicCode', description: 'Slug code của topic', example: 'brand-identity' })
    @ApiResponse({ status: 200, description: 'Chi tiết topic' })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    @ApiResponse({ status: 404, type: NotFoundResponseDto })
    async getTopicDetails(
        @Param('code') code: string,
        @Param('topicCode') topicCode: string
    ) {
        return this.communityService.findTopicDetails(code, topicCode)
    }
}
