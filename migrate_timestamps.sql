DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (
        SELECT table_name, column_name 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND data_type = 'timestamp without time zone'
    ) LOOP
        EXECUTE 'ALTER TABLE ' || quote_ident(r.table_name) || ' ALTER COLUMN ' || quote_ident(r.column_name) || ' TYPE timestamptz';
    END LOOP;
END $$;
