DO $$
DECLARE
    v_creator_id TEXT := '2d17d7c3-1b1f-4b3b-9551-f1cdbdb69b70'; -- ch.duong
    v_status_id TEXT := 'f6db8c15-94cb-47d4-9d73-3b72c0dd19a7';  -- in-progress
    
    v_type_record RECORD;
    v_job_id TEXT;
    v_income FLOAT;
    v_job_no TEXT;
    
    v_total_to_create INT := 30;
    v_jobs_per_type INT;
    v_current_count INT := 0;
    v_type_sequence INT;
    v_assign_count INT;
BEGIN
    v_jobs_per_type := ceil(v_total_to_create / 3.0);

    FOR v_type_record IN SELECT id, code FROM "JobType" LOOP
        v_type_sequence := 1; 

        FOR i IN 1..v_jobs_per_type LOOP
            EXIT WHEN v_current_count >= v_total_to_create;
            
            v_job_id := gen_random_uuid()::TEXT;
            v_job_no := v_type_record.code || '26' || LPAD(v_type_sequence::text, 3, '0');
            v_income := floor(random() * (1000 - 500 + 1) + 500);
            v_assign_count := floor(random() * (4 - 2 + 1) + 2);

            -- 1. Insert Job (Initially set totalStaffCost to 0, we update it after assignments)
            INSERT INTO "Job" (
                id, no, "typeId", "displayName", "description", 
                "incomeCost", "totalStaffCost", "createdById", "statusId", 
                priority, "dueAt", "createdAt", "updatedAt"
            ) VALUES (
                v_job_id, 
                v_job_no, 
                v_type_record.id, 
                'Project ' || v_job_no || ' Task', 
                'Automated creation with individual staff costs for ' || v_type_record.code,
                v_income, 
                0, -- Placeholder
                v_creator_id, 
                v_status_id, 
                (ARRAY['LOW', 'MEDIUM', 'HIGH', 'URGENT'])[floor(random()*4)+1]::"JobPriority",
                NOW() + (random() * 20 + 5) * INTERVAL '1 day',
                NOW(), 
                NOW()
            );

            -- 2. Insert Random Assignments with UNIQUE individual costs
            -- Each row in the SELECT gets its own random calculation
            INSERT INTO "JobAssignment" ("id", "jobId", "userId", "staffCost", "assignedAt")
            SELECT 
                gen_random_uuid()::TEXT, 
                v_job_id, 
                id, 
                -- Individual cost: (Income * random 15-25%) * 25,400 rate
                floor((v_income * (random() * (0.25 - 0.15) + 0.15)) * 25400),
                NOW()
            FROM "User"
            WHERE id::TEXT != v_creator_id 
            ORDER BY random()
            LIMIT v_assign_count;

            -- 3. Update the Job totalStaffCost with the actual sum of assignments
            UPDATE "Job" 
            SET "totalStaffCost" = (
                SELECT SUM("staffCost") 
                FROM "JobAssignment" 
                WHERE "jobId" = v_job_id
            )
            WHERE id = v_job_id;

            -- 4. Update Counters
            v_type_sequence := v_type_sequence + 1;
            v_current_count := v_current_count + 1;
        END LOOP;
    END LOOP;

    RAISE NOTICE 'Seeded % jobs with unique staff costs successfully.', v_current_count;
END $$;