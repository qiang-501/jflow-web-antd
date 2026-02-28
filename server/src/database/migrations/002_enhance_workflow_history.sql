-- Migration: Enhance workflow_history table with comprehensive change tracking
-- Date: Generated
-- Description: Adds change_type enum, field_changes, old_data, and new_data columns

-- Create enum type for change types
DO $$ BEGIN
    CREATE TYPE change_type_enum AS ENUM (
        'status_change',
        'form_data_create',
        'form_data_update',
        'workflow_update',
        'workflow_create',
        'workflow_delete'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add new columns to workflow_history table
ALTER TABLE workflow_history
    ADD COLUMN IF NOT EXISTS change_type change_type_enum DEFAULT 'workflow_update',
    ADD COLUMN IF NOT EXISTS field_changes jsonb,
    ADD COLUMN IF NOT EXISTS old_data jsonb,
    ADD COLUMN IF NOT EXISTS new_data jsonb;

-- Create index on change_type for faster filtering
CREATE INDEX IF NOT EXISTS idx_workflow_history_change_type
    ON workflow_history(change_type);

-- Create index on workflow_id and created_at for efficient history queries
CREATE INDEX IF NOT EXISTS idx_workflow_history_workflow_created
    ON workflow_history(workflow_id, created_at DESC);

-- Add comments for documentation
COMMENT ON COLUMN workflow_history.change_type IS 'Type of change: status_change, form_data_create, form_data_update, workflow_update, workflow_create, workflow_delete';
COMMENT ON COLUMN workflow_history.field_changes IS 'Array of field-level changes with structure: [{field, oldValue, newValue, fieldLabel}]';
COMMENT ON COLUMN workflow_history.old_data IS 'Complete snapshot of data before the change';
COMMENT ON COLUMN workflow_history.new_data IS 'Complete snapshot of data after the change';
