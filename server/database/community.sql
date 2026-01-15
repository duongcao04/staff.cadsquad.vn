-- =============================================================================
-- COMMUNITY SYSTEM SEED DATA (community.sql)
-- =============================================================================
-- 1. INSERT COMMUNITIES (Department Hubs)
-- IDs are kept as originally provided
INSERT INTO
	"Community" (
		"id",
		"code",
		"displayName",
		"color",
		"icon",
		"banner",
		"description",
		"updatedAt",
		"createdAt"
	)
VALUES
	(
		'1a6c2f3e-9f5d-4b7a-9c8a-1e3c7b5a2d91',
		'c-sales-n-marketing',
		'Sales & Marketing Hub',
		'#647c96',
		'https://res.cloudinary.com/dqx1guyc0/image/upload/v1766826913/CSD-_Sales_icon_nuofmz.jpg',
		'https://res.cloudinary.com/dqx1guyc0/image/upload/v1766821174/CSD-Sales_ew0s0o.png',
		'Collaborative space for CSD Sales and Marketing strategy.',
		NOW (),
		NOW ()
	),
	(
		'3f8b6e4a-2d91-4c5f-a8e1-7b9c0d2a4f63',
		'c-engineering',
		'Engineering Core',
		'#5a7386',
		'https://res.cloudinary.com/dqx1guyc0/image/upload/v1766827412/CSD-_Engineer_icon_fpv61c.jpg',
		'https://res.cloudinary.com/dqx1guyc0/image/upload/v1766821173/CSD-_Engineer_rikaw5.jpg',
		'Technical R&D, CAD standards, and engineering documentation.',
		NOW (),
		NOW ()
	),
	(
		'9c1f4a7d-5b62-4e83-a1d9-0f6b8c3e2a75',
		'cadsquad-global',
		'CADSQUAD Global',
		'#fd5c0e',
		'https://res.cloudinary.com/dqx1guyc0/image/upload/v1765885688/AVATAR-_Fiverr_kwcsip.png',
		'https://res.cloudinary.com/dqx1guyc0/image/upload/v1766821215/CSD-_CADSQUAD_dv3ngu.jpg',
		'The main company-wide community for all departments.',
		NOW (),
		NOW ()
	) ON CONFLICT (code) DO
UPDATE
SET
	"displayName" = EXCLUDED."displayName",
	"color" = EXCLUDED."color",
	"icon" = EXCLUDED."icon",
	"banner" = EXCLUDED."banner",
	"description" = EXCLUDED."description",
	"updatedAt" = NOW ();

-- 2. INSERT TOPICS (Channels within Communities)
-- Replaced text IDs with Static UUIDs (Pattern: 2222...)
INSERT INTO
	"Topic" (
		"id",
		"code",
		"title",
		"type",
		"communityId",
		"description",
		"updatedAt",
		"createdAt"
	)
VALUES
	-- Topics for Sales & Marketing (Community: 1a6c...)
	(
		'22222222-2222-2222-2222-222222220001',
		'sales-notices',
		'1. Sales Notices',
		'ANNOUNCEMENT',
		'1a6c2f3e-9f5d-4b7a-9c8a-1e3c7b5a2d91',
		'Official department announcements.',
		NOW (),
		NOW ()
	),
	(
		'22222222-2222-2222-2222-222222220002',
		'sales-kaizen',
		'2. Marketing Ideas',
		'IDEA',
		'1a6c2f3e-9f5d-4b7a-9c8a-1e3c7b5a2d91',
		'Brainstorming for continuous improvement.',
		NOW (),
		NOW ()
	),
	(
		'22222222-2222-2222-2222-222222220003',
		'sales-it',
		'3. IT Support',
		'SUPPORT',
		'1a6c2f3e-9f5d-4b7a-9c8a-1e3c7b5a2d91',
		'Tech support specific to sales tools.',
		NOW (),
		NOW ()
	),
	-- Topics for Engineering (Community: 3f8b...)
	(
		'22222222-2222-2222-2222-222222220004',
		'eng-notices',
		'1. Engineering Notices',
		'ANNOUNCEMENT',
		'3f8b6e4a-2d91-4c5f-a8e1-7b9c0d2a4f63',
		'Standards and technical updates.',
		NOW (),
		NOW ()
	),
	(
		'22222222-2222-2222-2222-222222220005',
		'eng-files',
		'2. CAD Blueprints',
		'FILES',
		'3f8b6e4a-2d91-4c5f-a8e1-7b9c0d2a4f63',
		'Shared technical library.',
		NOW (),
		NOW ()
	),
	(
		'22222222-2222-2222-2222-222222220006',
		'eng-rnd',
		'3. Technical R&D',
		'GENERAL',
		'3f8b6e4a-2d91-4c5f-a8e1-7b9c0d2a4f63',
		'Research and Development discussions.',
		NOW (),
		NOW ()
	),
	-- Topics for CADSQUAD Global (Community: 9c1f...)
	(
		'22222222-2222-2222-2222-222222220007',
		'global-news',
		'1. Company News',
		'ANNOUNCEMENT',
		'9c1f4a7d-5b62-4e83-a1d9-0f6b8c3e2a75',
		'News for all employees.',
		NOW (),
		NOW ()
	),
	(
		'22222222-2222-2222-2222-222222220008',
		'global-kaizen',
		'2. Global Kaizen',
		'IDEA',
		'9c1f4a7d-5b62-4e83-a1d9-0f6b8c3e2a75',
		'Company-wide improvement suggestions.',
		NOW (),
		NOW ()
	),
	(
		'22222222-2222-2222-2222-222222220009',
		'global-fun',
		'3. Sports & Social',
		'GENERAL',
		'9c1f4a7d-5b62-4e83-a1d9-0f6b8c3e2a75',
		'Non-work related discussions.',
		NOW (),
		NOW ()
	) ON CONFLICT (code) DO
UPDATE
SET
	"title" = EXCLUDED."title",
	"type" = EXCLUDED."type",
	"communityId" = EXCLUDED."communityId",
	"description" = EXCLUDED."description",
	"updatedAt" = NOW ();

-- 3. INSERT COMMUNITY MEMBERS
-- Replaced gen_random_uuid() with Static UUIDs (Pattern: 3333...)
INSERT INTO
	"CommunityMember" ("id", "userId", "communityId", "role", "joinedAt")
VALUES
	-- Admin: Phong (Manager Dept) joins Global and Sales
	(
		'33333333-3333-3333-3333-333333330001',
		'a9f843e6-dce5-47b4-a6a9-97f7a38b9a0d',
		'9c1f4a7d-5b62-4e83-a1d9-0f6b8c3e2a75',
		'OWNER',
		NOW ()
	),
	(
		'33333333-3333-3333-3333-333333330002',
		'a9f843e6-dce5-47b4-a6a9-97f7a38b9a0d',
		'1a6c2f3e-9f5d-4b7a-9c8a-1e3c7b5a2d91',
		'MODERATOR',
		NOW ()
	),
	-- Admin: Duong (Admin Dept) joins Global and Engineering
	(
		'33333333-3333-3333-3333-333333330003',
		'2d17d7c3-1b1f-4b3b-9551-f1cdbdb69b70',
		'9c1f4a7d-5b62-4e83-a1d9-0f6b8c3e2a75',
		'OWNER',
		NOW ()
	),
	(
		'33333333-3333-3333-3333-333333330004',
		'2d17d7c3-1b1f-4b3b-9551-f1cdbdb69b70',
		'3f8b6e4a-2d91-4c5f-a8e1-7b9c0d2a4f63',
		'MODERATOR',
		NOW ()
	),
	-- Engineering Staff (Son, Dat, Hieu)
	(
		'33333333-3333-3333-3333-333333330005',
		'bc08c27c-1dd3-4e88-9b3f-8c8a9d71b290',
		'3f8b6e4a-2d91-4c5f-a8e1-7b9c0d2a4f63',
		'MEMBER',
		NOW ()
	),
	(
		'33333333-3333-3333-3333-333333330006',
		'e3f41716-3f91-4e6c-8f4c-2df89a9cf403',
		'3f8b6e4a-2d91-4c5f-a8e1-7b9c0d2a4f63',
		'MEMBER',
		NOW ()
	),
	(
		'33333333-3333-3333-3333-333333330007',
		'f77e8bb3-d633-46cb-a269-4e2f17e91173',
		'3f8b6e4a-2d91-4c5f-a8e1-7b9c0d2a4f63',
		'MEMBER',
		NOW ()
	),
	-- Accountant: Vy joins Global
	(
		'33333333-3333-3333-3333-333333330008',
		'c4d35f1b-9b37-4a3f-804b-373f7b0e1a24',
		'9c1f4a7d-5b62-4e83-a1d9-0f6b8c3e2a75',
		'MEMBER',
		NOW ()
	) ON CONFLICT DO NOTHING;

-- 4. INSERT POSTS (Initial Feed Content)
-- Replaced IDs with Static UUIDs (Pattern: 4444...)
-- Updated topicId to match the new Topic UUIDs
INSERT INTO
	"Post" (
		"id",
		"content",
		"authorId",
		"topicId",
		"isPinned",
		"createdAt",
		"updatedAt"
	)
VALUES
	(
		'44444444-4444-4444-4444-444444440001',
		'Welcome to the official CADSQUAD Global portal! Use this hub for all internal communications.',
		'a9f843e6-dce5-47b4-a6a9-97f7a38b9a0d',
		'22222222-2222-2222-2222-222222220007', -- Mapped to topic: global-news
		true,
		NOW (),
		NOW ()
	),
	(
		'44444444-4444-4444-4444-444444440002',
		'Reminder: All CAD drawings must follow the 2024 revision standards found in the FILES topic.',
		'2d17d7c3-1b1f-4b3b-9551-f1cdbdb69b70',
		'22222222-2222-2222-2222-222222220004', -- Mapped to topic: eng-notices
		true,
		NOW () - INTERVAL '1 day',
		NOW () - INTERVAL '1 day'
	),
	(
		'44444444-4444-4444-4444-444444440003',
		'Kaizen Idea: Adding a dark mode toggle to our client project management dashboard.',
		'bc08c27c-1dd3-4e88-9b3f-8c8a9d71b290',
		'22222222-2222-2222-2222-222222220008', -- Mapped to topic: global-kaizen
		false,
		NOW () - INTERVAL '2 hours',
		NOW () - INTERVAL '2 hours'
	) ON CONFLICT ("id") DO
UPDATE
SET
	"content" = EXCLUDED."content",
	"isPinned" = EXCLUDED."isPinned",
	"updatedAt" = NOW ();