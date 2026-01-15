import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { BrowserSubscribesService } from './browser-subscribes.service';
import { CreateBrowserSubscribeDto } from './dto/create-browser-subscribe.dto';
import { UpdateBrowserSubscribeDto } from './dto/update-browser-subscribe.dto';

@ApiTags('Browser Subscribes')
@Controller('browser-subscribes')
export class BrowserSubscribesController {
  constructor(
    private readonly browserSubscribesService: BrowserSubscribesService,
  ) { }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new browser subscription' })
  @ApiResponse({ status: 201, description: 'The subscription has been successfully created.' })
  create(@Body() createBrowserSubscribeDto: CreateBrowserSubscribeDto) {
    return this.browserSubscribesService.create(createBrowserSubscribeDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all browser subscriptions' })
  @ApiResponse({ status: 200, description: 'Return all subscriptions.' })
  findAll() {
    return this.browserSubscribesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a browser subscription by ID' })
  @ApiResponse({ status: 200, description: 'Return a single subscription.' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.browserSubscribesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a browser subscription' })
  @ApiResponse({ status: 200, description: 'The subscription has been successfully updated.' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateBrowserSubscribeDto: UpdateBrowserSubscribeDto,
  ) {
    return this.browserSubscribesService.update(id, updateBrowserSubscribeDto);
  }

  @Delete('by-endpoint')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a browser subscription by endpoint' })
  @ApiResponse({ status: 204, description: 'The subscription has been successfully deleted.' })
  removeByEndpoint(@Body() { endpoint }: { endpoint: string }) {
    return this.browserSubscribesService.removeByEndpoint(endpoint);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a browser subscription by ID' })
  @ApiResponse({ status: 204, description: 'The subscription has been successfully deleted.' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.browserSubscribesService.remove(id);
  }
}