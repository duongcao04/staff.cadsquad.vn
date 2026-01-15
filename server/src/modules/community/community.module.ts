import { Module } from '@nestjs/common';
import { CommunityService } from './community.service';
import { CommunityController } from './community.controller';
import { PostService } from './post.service';

@Module({
  controllers: [CommunityController],
  providers: [CommunityService, PostService],
})
export class CommunityModule { }
