-- =============================================
-- 1. SEED DEPARTMENT
-- =============================================
INSERT INTO
	"Department" (
		id,
		code,
		"displayName",
		"hexColor",
		"createdAt",
		"updatedAt"
	)
VALUES
	(
		'5aac88f8-e4f7-47e2-a9ef-652c44116c8c',
		'management',
		'Management',
		'#f65333',
		NOW (),
		NOW ()
	),
	(
		'760a1ffa-2ce5-435c-b778-7a109b74e220',
		'engineering',
		'Engineering',
		'#fda53c',
		NOW (),
		NOW ()
	),
	(
		'e3551dd9-7be9-42f3-91e2-c826004b693d',
		'sales-and-marketing',
		'Sales & Marketing',
		'#ffd633',
		NOW (),
		NOW ()
	),
	(
		'b92a66c3-a0e6-4b4c-a4c6-2759ea97a9c2',
		'administration',
		'Administration',
		'#3cb371',
		NOW (),
		NOW ()
	),
	(
		'09f4216e-e20c-4bf5-aa3e-3c65da7613eb',
		'finance-and-accounting',
		'Finance & Accounting',
		'#3b82f6',
		NOW (),
		NOW ()
	) ON CONFLICT (code) DO
UPDATE
SET
	"displayName" = EXCLUDED."displayName",
	"hexColor" = EXCLUDED."hexColor",
	"updatedAt" = NOW ();

-- =============================================
-- 2. SEED JOB STATUS
-- =============================================
INSERT INTO
	"JobStatus" (
		id,
		"displayName",
		code,
		"thumbnailUrl",
		"hexColor",
		icon,
		"nextStatusOrder",
		"prevStatusOrder",
		"order",
		"systemType", -- 1. Thêm cột này
		"createdAt",
		"updatedAt"
	)
VALUES
	(
		'f6db8c15-94cb-47d4-9d73-3b72c0dd19a7',
		'In Progress',
		'in-progress',
		'https://res.cloudinary.com/dqx1guyc0/image/upload/v1752159965/Cadsquad/STAFF/JOB_STATUS/JOB-_IN_PROGRESS_oofjpd.png',
		'#dc9b40',
		'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-loader-icon lucide-loader"><path d="M12 2v4"/><path d="m16.2 7.8 2.9-2.9"/><path d="M18 12h4"/><path d="m16.2 16.2 2.9 2.9"/><path d="M12 18v4"/><path d="m4.9 19.1 2.9-2.9"/><path d="M2 12h4"/><path d="m4.9 4.9 2.9 2.9"/></svg>',
		2,
		NULL,
		1,
		'STANDARD', -- In Progress là trạng thái thường
		NOW (),
		NOW ()
	),
	(
		'e5a8c177-8a69-4f9c-8f4d-bb7c2f43d11a',
		'Delivered',
		'delivered',
		'https://res.cloudinary.com/dqx1guyc0/image/upload/v1752159965/Cadsquad/STAFF/JOB_STATUS/JOB-DELIVERED_tsnmqv.png',
		'#960ebf',
		'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-package-check-icon lucide-package-check"><path d="m16 16 2 2 4-4"/><path d="M21 10V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l2-1.14"/><path d="m7.5 4.27 9 5.15"/><polyline points="3.29 7 12 12 20.71 7"/><line x1="12" x2="12" y1="22" y2="12"/></svg>',
		3,
		4,
		2,
		'DELIVERED', -- Delivered vẫn nằm trong luồng xử lý (chờ duyệt)
		NOW (),
		NOW ()
	),
	(
		'0fd0a749-48e4-4c89-9bbd-6f21542c11d3',
		'Completed',
		'completed',
		'https://res.cloudinary.com/dqx1guyc0/image/upload/v1752159964/Cadsquad/STAFF/JOB_STATUS/JOB-_COMPLETED_e0xlg9.png',
		'#5f8fe8',
		'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle-check-big-icon lucide-circle-check-big"><path d="M21.801 10A10 10 0 1 1 17 3.335"/><path d="m9 11 3 3L22 4"/></svg>',
		5,
		NULL,
		3,
		'COMPLETED', -- Completed đánh dấu hoàn thành nhiệm vụ
		NOW (),
		NOW ()
	),
	(
		'9b8dcb2c-f7cf-440f-95de-7c16bb4f34de',
		'Revision',
		'revision',
		'https://res.cloudinary.com/dqx1guyc0/image/upload/v1752159955/Cadsquad/STAFF/JOB_STATUS/JOB_IN_REVISION_pu2pnu.png',
		'#de575b',
		'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-refresh-ccw-icon lucide-refresh-ccw"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 16h5v5"/></svg>',
		2,
		NULL,
		4,
		'STANDARD', -- Revision quay lại luồng xử lý
		NOW (),
		NOW ()
	),
	(
		'3c7d3db5-20f3-4675-8e5d-0f6fc53e1dc8',
		'Finish',
		'finish',
		'https://res.cloudinary.com/dqx1guyc0/image/upload/v1752159965/Cadsquad/STAFF/JOB_STATUS/JOB-_FINISH_xipa75.png',
		'#64b249',
		'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-hand-coins-icon lucide-hand-coins"><path d="M11 15h2a2 2 0 1 0 0-4h-3c-.6 0-1.1.2-1.4.6L3 17"/><path d="m7 21 1.6-1.4c.3-.4.8-.6 1.4-.6h4c1.1 0 2.1-.4 2.8-1.2l4.6-4.4a2 2 0 0 0-2.75-2.91l-4.2 3.9"/><path d="m2 16 6 6"/><circle cx="16" cy="9" r="2.9"/><circle cx="6" cy="5" r="3"/></svg>',
		NULL,
		NULL,
		5,
		'TERMINATED', -- Finish là kết thúc vòng đời
		NOW (),
		NOW ()
	) ON CONFLICT (code) DO
UPDATE
SET
	"displayName" = EXCLUDED."displayName",
	"thumbnailUrl" = EXCLUDED."thumbnailUrl",
	"hexColor" = EXCLUDED."hexColor",
	icon = EXCLUDED.icon,
	"nextStatusOrder" = EXCLUDED."nextStatusOrder",
	"prevStatusOrder" = EXCLUDED."prevStatusOrder",
	"order" = EXCLUDED."order",
	"systemType" = EXCLUDED."systemType", -- 2. Nhớ update cả cột này
	"updatedAt" = NOW ();

-- =============================================
-- 3. SEED JOB TITLE
-- =============================================
INSERT INTO
	"JobTitle" (id, "displayName", code, "createdAt", "updatedAt")
VALUES
	(
		'8f49df5c-5d6b-48ea-9f8a-0b7e8e727f68',
		'Mobile Developer',
		'mobile_dev',
		NOW (),
		NOW ()
	),
	(
		'7b9370c6-0873-4690-8e6c-7469f2a9a68f',
		'Web Developer',
		'web_dev',
		NOW (),
		NOW ()
	),
	(
		'f4c342b2-0f5e-4b73-a5ff-30dbf24a7762',
		'System Administrator',
		'sys_admin',
		NOW (),
		NOW ()
	),
	(
		'8f1f0f3e-d828-45db-9a19-1a30a0c0c5a5',
		'Accountant',
		'accountant',
		NOW (),
		NOW ()
	),
	(
		'7c6d12b1-bbb4-44f7-88af-25746a9c9eb8',
		'Tax Accountant',
		'tax_accountant',
		NOW (),
		NOW ()
	),
	(
		'4b6c02ae-2f8d-4baf-95f4-143bfe4a17e3',
		'SEO Specialist',
		'seo_specialist',
		NOW (),
		NOW ()
	),
	(
		'2b67fc5b-4f36-4d9d-9c7b-97e4d1f776b4',
		'Content Creator',
		'content_creator',
		NOW (),
		NOW ()
	),
	(
		'0d8d3d59-f1cb-48ff-b815-21cb930f5e67',
		'Customer Service Representative',
		'customer_service',
		NOW (),
		NOW ()
	),
	(
		'3d745eb0-4cc7-442f-bf0c-bdfdd7a9935a',
		'Support Specialist',
		'support_specialist',
		NOW (),
		NOW ()
	),
	(
		'e8c4a5b4-1af9-44a6-8d0d-d5f3c9fa07ef',
		'Mechanical Engineer',
		'mechanical_engineer',
		NOW (),
		NOW ()
	),
	(
		'5d6c1d5d-3d64-4720-b9b8-72a1a89b0eb9',
		'Machine Design Engineer',
		'machine_design_engineer',
		NOW (),
		NOW ()
	),
	(
		'fb2c6c56-7e07-4b82-b2f6-290d9c6d8f9b',
		'Manufacturing Engineer',
		'manufacturing_engineer',
		NOW (),
		NOW ()
	),
	(
		'26e5f7f1-1b6f-4db0-baf4-1cf7cde271ab',
		'Maintenance Engineer',
		'maintenance_engineer',
		NOW (),
		NOW ()
	),
	(
		'dd30de6d-cc28-4d49-a9e1-3f6a8d71a97e',
		'Production Engineer',
		'production_engineer',
		NOW (),
		NOW ()
	),
	(
		'4f7aebc1-10a4-4a5a-8a07-82778c4a3056',
		'Industrial Engineer',
		'industrial_engineer',
		NOW (),
		NOW ()
	),
	(
		'16c7c34e-85f4-4d34-a657-89601b7f40a0',
		'Quality Engineer',
		'quality_engineer',
		NOW (),
		NOW ()
	),
	(
		'c5b9c2ed-f032-41b0-bf63-d846b8fc6aa4',
		'Automation Engineer',
		'automation_engineer',
		NOW (),
		NOW ()
	),
	(
		'b2315ec2-9b67-457c-8260-1fc761db9c2a',
		'Process Engineer',
		'process_engineer',
		NOW (),
		NOW ()
	),
	(
		'79b82a17-11b1-48c4-83f5-f3c9b24b7b0f',
		'CNC Programmer',
		'cnc_programmer',
		NOW (),
		NOW ()
	),
	(
		'd23f6d14-b5d8-4e2f-9ebf-6b9ef28f1dc8',
		'Tooling Engineer',
		'tooling_engineer',
		NOW (),
		NOW ()
	),
	(
		'6fb479c3-d1cc-4a73-8b7a-1b80e50ec1c1',
		'Reliability Engineer',
		'reliability_engineer',
		NOW (),
		NOW ()
	),
	(
		'4a1fdd62-b77d-4c18-a7b6-56c7f44a4d1e',
		'CEO',
		'ceo',
		NOW (),
		NOW ()
	),
	(
		'8c7fd9a4-2d2e-47ab-93d0-28b4b58de9c7',
		'COO',
		'coo',
		NOW (),
		NOW ()
	),
	(
		'37c6fb5a-0b0e-4b5d-8c9c-8cfe8b7ecb14',
		'CTO',
		'cto',
		NOW (),
		NOW ()
	),
	(
		'b0d91d34-f5f1-4b94-9b29-3c0c24e20e91',
		'CFO',
		'cfo',
		NOW (),
		NOW ()
	) ON CONFLICT (code) DO
UPDATE
SET
	"displayName" = EXCLUDED."displayName",
	"updatedAt" = NOW ();

-- =============================================
-- 4. SEED JOB TYPE
-- =============================================
INSERT INTO
	"JobType" (
		id,
		"displayName",
		"code",
		"sharepointFolderId",
		"hexColor",
		"createdAt",
		"updatedAt"
	)
VALUES
	(
		'2f9c6060-7f9b-42a5-b6fa-df3ac9627c42',
		'Fiverr',
		'F',
		'012FXBO3JFIRND5UAJSZAKOBEOL2XAODZ4',
		'#173912',
		NOW (),
		NOW ()
	),
	(
		'f93c8c34-f85f-46b6-8dbf-b9e10fd2f3cb',
		'Global',
		'G',
		'012FXBO3NBL3STJRQGKBF2T2HZQBCOJFQP',
		'#04396C',
		NOW (),
		NOW ()
	),
	(
		'9c78d5e6-4f11-47d4-8cb3-dfe287d9b763',
		'Vietnam',
		'V',
		'012FXBO3JCPAUY2LLVP5EIKQOIB5LKLXH6',
		'#D43A2E',
		NOW (),
		NOW ()
	) ON CONFLICT DO NOTHING;

-- =============================================
-- 5. SEED PAYMENT CHANNEL
-- =============================================
INSERT INTO
	"PaymentChannel" (
		id,
		"displayName",
		"logoUrl",
		"hexColor",
		"createdAt",
		"updatedAt"
	)
VALUES
	(
		'2f8a5a4d-6c4e-4f90-8f64-94bde3acbd2d',
		'FV.PTP',
		'https://netolink.com/wp-content/uploads/2024/10/Fiverr.png',
		'#4A90E2',
		NOW (),
		NOW ()
	),
	(
		'c9f134a5-3a72-42e1-b9fa-4f2b3b2b85a9',
		'FV.CSD',
		'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTpf1zBSVqPp4vBNY8zpzqNs7UH_4kd7SvdvQ&s',
		'#50E3C2',
		NOW (),
		NOW ()
	),
	(
		'4e6c64c7-08fb-46df-83aa-49c2bb91f9db',
		'CSD.PAYPAL',
		'https://cdn-1.webcatalog.io/catalog/paypal/paypal-icon-filled-256.png?v=1759711656953',
		'#003087',
		NOW (),
		NOW ()
	),
	(
		'7f2e2b76-16e0-4e0c-83b7-91a924f1ef62',
		'CSD.PAYONEER',
		'https://clemta.com/wp-content/uploads/2023/05/Payoneer.png',
		'#FF4800',
		NOW (),
		NOW ()
	),
	(
		'5b7d2d1f-2c9a-4f4b-a38d-7fbb3f0797d6',
		'CSD.BINANCE',
		'https://public.bnbstatic.com/20190405/eb2349c3-b2f8-4a93-a286-8f86a62ea9d8.png',
		'#F0B90B',
		NOW (),
		NOW ()
	),
	(
		'a18d5a9b-d067-493f-a7d7-2fb6b31d54de',
		'CSD.ACB',
		'https://cdn.tgdd.vn/2020/04/GameApp/unnamed-200x200-18.png',
		'#00509B',
		NOW (),
		NOW ()
	) ON CONFLICT DO NOTHING;

-- =============================================
-- 6. SEED USER (Updated for Better Auth Schema)
--    Note: Mapped old 'avatar' values to new 'image' column.
-- =============================================
INSERT INTO
	"User" (
		id,
		email,
		code,
		"username",
		"displayName",
		"avatar",
		"phoneNumber",
		"roleId",
		"departmentId",
		"emailVerified", -- Required for Better Auth
		"password",
		"createdAt",
		"updatedAt"
	)
VALUES
	(
		'a9f843e6-dce5-47b4-a6a9-97f7a38b9a0d',
		'pt.phong@cadsquad.vn',
		'ST001',
		'pt.phong',
		'Phạm Tiền Phong',
		'https://res.cloudinary.com/dqx1guyc0/image/upload/v1761629822/Cadsquad/STAFF/Avatar/PT.Phong.jpg',
		null,
		'role-0000-0000-0000-0000-000000000001',
		'5aac88f8-e4f7-47e2-a9ef-652c44116c8c',
		true,
		'cadsquad123',
		NOW (),
		NOW ()
	),
	(
		'c4d35f1b-9b37-4a3f-804b-373f7b0e1a24',
		'nb.vy@cadsquad.vn',
		'ST002',
		'nb.vy',
		'Nguyễn Bảo Vy',
		'https://res.cloudinary.com/dqx1guyc0/image/upload/v1761629788/Cadsquad/STAFF/Avatar/NB.Vy.jpg',
		null,
		'role-0000-0000-0000-0000-000000000003',
		'09f4216e-e20c-4bf5-aa3e-3c65da7613eb',
		true,
		'cadsquad123',
		NOW (),
		NOW ()
	),
	(
		'e3f41716-3f91-4e6c-8f4c-2df89a9cf403',
		'lt.dat@cadsquad.vn',
		'ST003',
		'lt.dat',
		'Lê Thành Đạt',
		'https://res.cloudinary.com/dqx1guyc0/image/upload/v1761629776/Cadsquad/STAFF/Avatar/LT.Dat.jpg',
		null,
		'role-0000-0000-0000-0000-000000000002',
		'760a1ffa-2ce5-435c-b778-7a109b74e220',
		true,
		'cadsquad123',
		NOW (),
		NOW ()
	),
	(
		'b9f2ab5c-8442-4f1c-84b8-6471e6a51c65',
		'nkh.minh@cadsquad.vn',
		'ST004',
		'nkh.minh',
		'Nguyễn Khoa Hải Minh',
		'https://res.cloudinary.com/dqx1guyc0/image/upload/v1761629833/Cadsquad/STAFF/Avatar/NKH.Minh.jpg',
		null,
		'role-0000-0000-0000-0000-000000000002',
		'760a1ffa-2ce5-435c-b778-7a109b74e220',
		true,
		'cadsquad123',
		NOW (),
		NOW ()
	),
	(
		'f77e8bb3-d633-46cb-a269-4e2f17e91173',
		'nc.hieu@cadsquad.vn',
		'ST005',
		'nc.hieu',
		'Nguyễn Chí Hiếu',
		'https://res.cloudinary.com/dqx1guyc0/image/upload/v1761629795/Cadsquad/STAFF/Avatar/NC.Hieu.jpg',
		null,
		'role-0000-0000-0000-0000-000000000002',
		'760a1ffa-2ce5-435c-b778-7a109b74e220',
		true,
		'cadsquad123',
		NOW (),
		NOW ()
	),
	(
		'2d17d7c3-1b1f-4b3b-9551-f1cdbdb69b70',
		'ch.duong@cadsquad.vn',
		'ST006',
		'ch.duong',
		'Cao Hải Dương',
		'https://res.cloudinary.com/dqx1guyc0/image/upload/v1761629744/Cadsquad/STAFF/Avatar/CH.Duong.jpg',
		'+84-862-248-332',
		'role-0000-0000-0000-0000-000000000001',
		'b92a66c3-a0e6-4b4c-a4c6-2759ea97a9c2',
		true,
		'cadsquad123',
		NOW (),
		NOW ()
	),
	(
		'bc08c27c-1dd3-4e88-9b3f-8c8a9d71b290',
		'dc.son@cadsquad.vn',
		'ST007',
		'dc.son',
		'Đoàn Công Sơn',
		'https://res.cloudinary.com/dqx1guyc0/image/upload/v1761629761/Cadsquad/STAFF/Avatar/DC.Son.jpg',
		null,
		'role-0000-0000-0000-0000-000000000002',
		'760a1ffa-2ce5-435c-b778-7a109b74e220',
		true,
		'cadsquad123',
		NOW (),
		NOW ()
	),
	(
		'0e0dbee2-1c97-4ed8-a1d8-55437d32cb7d',
		'nt.phong@cadsquad.vn',
		'ST008',
		'nt.phong',
		'Nguyễn Thanh Phong',
		'https://ui-avatars.com/api/?name=nguyen+thanh+phong&background=random&size=128',
		null,
		'role-0000-0000-0000-0000-000000000002',
		'760a1ffa-2ce5-435c-b778-7a109b74e220',
		true,
		'cadsquad123',
		NOW (),
		NOW ()
	),
	(
		'52ccbfae-1814-4e77-b8f2-0f3f7e23d6c8',
		'dq.trong@cadsquad.vn',
		'ST009',
		'dq.trong',
		'Đặng Quốc Trọng',
		'https://ui-avatars.com/api/?name=dang+quoc+trong&background=random&size=128',
		null,
		'role-0000-0000-0000-0000-000000000002',
		'760a1ffa-2ce5-435c-b778-7a109b74e220',
		true,
		'cadsquad123',
		NOW (),
		NOW ()
	),
	(
		'ae24968c-0e5c-42e6-ad41-1eb9cfdbb73b',
		'nd.tinh@cadsquad.vn',
		'ST010',
		'nd.tinh',
		'Nguyễn Duy Tính',
		'https://ui-avatars.com/api/?name=nguyen+duy+tinh&background=random&size=128',
		null,
		'role-0000-0000-0000-0000-000000000002',
		'760a1ffa-2ce5-435c-b778-7a109b74e220',
		true,
		'cadsquad123',
		NOW (),
		NOW ()
	),
	(
		'45b613e6-b537-4ad6-9790-4e9ce4c3ddab',
		'hh.dang@cadsquad.vn',
		'ST011',
		'hh.dang',
		'Hồ Hải Đăng',
		'https://ui-avatars.com/api/?name=ho+hai+dang&background=random&size=128',
		null,
		'role-0000-0000-0000-0000-000000000002',
		'760a1ffa-2ce5-435c-b778-7a109b74e220',
		true,
		'cadsquad123',
		NOW (),
		NOW ()
	),
	(
		'0b919637-aa00-4210-85fc-5667808d8559',
		'ht.my@cadsquad.vn',
		'ST012',
		'ht.my',
		'Hồ Thiên Mỹ',
		'https://ui-avatars.com/api/?name=ho+thien+my&background=random&size=128',
		null,
		'role-0000-0000-0000-0000-000000000002',
		'760a1ffa-2ce5-435c-b778-7a109b74e220',
		true,
		'cadsquad123',
		NOW (),
		NOW ()
	),
	(
		'aa272ffc-f92c-4e26-ad57-f3cfc2376362',
		'plv.phong@cadsquad.vn',
		'ST013',
		'plv.phong',
		'Phạm Lê Vĩnh Phong',
		'https://res.cloudinary.com/dqx1guyc0/image/upload/v1768241268/Cadsquad/STAFF/Avatar/PLV.Phong_xbrkif.jpg',
		null,
		'role-0000-0000-0000-0000-000000000002',
		'760a1ffa-2ce5-435c-b778-7a109b74e220',
		true,
		'cadsquad123',
		NOW (),
		NOW ()
	),
	(
		'6173e6a8-9ca2-4ca7-b33a-a0d81e8ea348',
		'dq.huy@cadsquad.vn',
		'ST014',
		'dq.huy',
		'Đinh Quốc Huy',
		'https://res.cloudinary.com/dqx1guyc0/image/upload/v1768241268/Cadsquad/STAFF/Avatar/Q.Huy_sxk5at.jpg',
		null,
		'role-0000-0000-0000-0000-000000000002',
		'760a1ffa-2ce5-435c-b778-7a109b74e220',
		true,
		'cadsquad123',
		NOW (),
		NOW ()
	),
	(
		'8561f7d5-d746-4ff3-b1fc-5e28dc62038f',
		'nh.nhat@cadsquad.vn',
		'ST015',
		'nh.nhat',
		'Nguyễn Huy Nhất',
		'https://res.cloudinary.com/dqx1guyc0/image/upload/v1768241269/Cadsquad/STAFF/Avatar/NH.Nhat_ngdfd4.jpg',
		null,
		'role-0000-0000-0000-0000-000000000002',
		'760a1ffa-2ce5-435c-b778-7a109b74e220',
		true,
		'cadsquad123',
		NOW (),
		NOW ()
	) ON CONFLICT (email) DO
UPDATE
SET
	"displayName" = EXCLUDED."displayName",
	"avatar" = EXCLUDED."avatar",
	"phoneNumber" = EXCLUDED."phoneNumber",
	"roleId" = EXCLUDED."roleId",
	"password" = EXCLUDED."password",
	"departmentId" = EXCLUDED."departmentId",
	"updatedAt" = NOW ();

-- =============================================
-- 7. SEED ACCOUNT (For Local Login/Password)
--    Note: Schema moved password here. Assuming "credential" provider.
-- =============================================
INSERT INTO
	"Account" (
		id,
		"userId",
		"accountId",
		"providerId",
		"createdAt",
		"updatedAt"
	)
VALUES
	(
		'acc-a9f843e6-01',
		'a9f843e6-dce5-47b4-a6a9-97f7a38b9a0d',
		'a9f843e6-dce5-47b4-a6a9-97f7a38b9a0d',
		'credential',
		NOW (),
		NOW ()
	),
	(
		'acc-2d17d7c3-02',
		'2d17d7c3-1b1f-4b3b-9551-f1cdbdb69b70',
		'2d17d7c3-1b1f-4b3b-9551-f1cdbdb69b70',
		'credential',
		NOW (),
		NOW ()
	),
	(
		'acc-bc08c27c-03',
		'bc08c27c-1dd3-4e88-9b3f-8c8a9d71b290',
		'bc08c27c-1dd3-4e88-9b3f-8c8a9d71b290',
		'credential',
		NOW (),
		NOW ()
	),
	(
		'acc-e3f41716-04',
		'e3f41716-3f91-4e6c-8f4c-2df89a9cf403',
		'e3f41716-3f91-4e6c-8f4c-2df89a9cf403',
		'credential',
		NOW (),
		NOW ()
	),
	(
		'acc-f77e8bb3-05',
		'f77e8bb3-d633-46cb-a269-4e2f17e91173',
		'f77e8bb3-d633-46cb-a269-4e2f17e91173',
		'credential',
		NOW (),
		NOW ()
	),
	(
		'acc-b9f2ab5c-06',
		'b9f2ab5c-8442-4f1c-84b8-6471e6a51c65',
		'b9f2ab5c-8442-4f1c-84b8-6471e6a51c65',
		'credential',
		NOW (),
		NOW ()
	),
	(
		'acc-c4d35f1b-07',
		'c4d35f1b-9b37-4a3f-804b-373f7b0e1a24',
		'c4d35f1b-9b37-4a3f-804b-373f7b0e1a24',
		'credential',
		NOW (),
		NOW ()
	) ON CONFLICT (id) DO NOTHING;

-- =============================================
-- 8. SEED CLIENT
-- =============================================
INSERT INTO
	"Client" (
		id,
		code,
		name,
		email,
		"phoneNumber",
		region,
		country,
		currency,
		"taxId",
		"paymentTerms",
		"createdAt",
		"updatedAt"
	)
VALUES
	(
		'c1b2a3d4-e5f6-7890-abcd-111111111111',
		'CL-AUTO-001',
		'Tesla Motors',
		'billing@tesla.com',
		'+1-888-518-3752',
		'North America',
		'USA',
		'USD',
		'US-123456789',
		30,
		NOW (),
		NOW ()
	),
	(
		'c2b3a4d5-e6f7-8901-bcde-222222222222',
		'CL-TECH-002',
		'Samsung Electronics',
		'accounts@samsung.com',
		'+82-2-2053-3000',
		'Asia Pacific',
		'South Korea',
		'USD',
		'KR-987654321',
		15,
		NOW (),
		NOW ()
	),
	(
		'c3b4a5d6-e7f8-9012-cdef-333333333333',
		'CL-VN-003',
		'VinFast Vietnam',
		'contact@vinfast.vn',
		'+84-1900-232389',
		'Vietnam',
		'Vietnam',
		'VND',
		'VN-1122334455',
		7,
		NOW (),
		NOW ()
	),
	(
		'c4b5a6d7-e8f9-0123-defg-444444444444',
		'CL-EU-004',
		'Siemens AG',
		'finance@siemens.de',
		'+49-89-636-00',
		'Europe',
		'Germany',
		'EUR',
		'DE-556677889',
		45,
		NOW (),
		NOW ()
	) ON CONFLICT (code) DO
UPDATE
SET
	"name" = EXCLUDED."name",
	"email" = EXCLUDED."email",
	"region" = EXCLUDED."region",
	"country" = EXCLUDED."country",
	"currency" = EXCLUDED."currency",
	"taxId" = EXCLUDED."taxId",
	"paymentTerms" = EXCLUDED."paymentTerms",
	"updatedAt" = NOW ();

INSERT INTO
	"Notification" (
		id,
		"userId",
		"title",
		"content",
		"type",
		"status",
		"createdAt",
		"updatedAt"
	)
SELECT
	gen_random_uuid (),
	id,
	'Welcome to CADSQUAD',
	'Your account has been successfully set up.',
	'SUCCESS',
	'UNSEEN',
	NOW (),
	NOW ()
FROM
	"User"
LIMIT
	10;