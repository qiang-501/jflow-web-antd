-- Migration Script: Add Workflow Templates and Refactor Form Fields
-- This script adds workflow template support and converts form fields from JSON to relational tables
-- Run this script on your existing database

-- Step 1: Create the form_fields table
CREATE TABLE IF NOT EXISTS form_fields (
  id SERIAL PRIMARY KEY,
  form_config_id INT NOT NULL,
  field_key VARCHAR(100) NOT NULL,
  field_type VARCHAR(50) NOT NULL,
  label VARCHAR(200) NOT NULL,
  placeholder TEXT,
  default_value TEXT,
  required BOOLEAN DEFAULT FALSE,
  disabled BOOLEAN DEFAULT FALSE,
  readonly BOOLEAN DEFAULT FALSE,
  order_index INT DEFAULT 0,
  span INT DEFAULT 24,
  options JSONB,
  validators JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (form_config_id) REFERENCES dynamic_form_configs(id) ON DELETE CASCADE
);

CREATE INDEX idx_form_fields_config_id ON form_fields(form_config_id);
CREATE INDEX idx_form_fields_key ON form_fields(field_key);
CREATE INDEX idx_form_fields_order ON form_fields(form_config_id, order_index);

-- Step 2: Migrate existing JSONB fields to the new table
-- This will extract fields from the 'fields' column and insert them into form_fields table
DO $$
DECLARE
  config_record RECORD;
  field_record JSONB;
  field_index INT;
BEGIN
  FOR config_record IN SELECT id, fields FROM dynamic_form_configs LOOP
    field_index := 0;
    FOR field_record IN SELECT * FROM jsonb_array_elements(config_record.fields) LOOP
      INSERT INTO form_fields (
        form_config_id,
        field_key,
        field_type,
        label,
        placeholder,
        default_value,
        required,
        disabled,
        readonly,
        order_index,
        span,
        options,
        validators
      ) VALUES (
        config_record.id,
        field_record->>'key',
        field_record->>'type',
        field_record->>'label',
        field_record->>'placeholder',
        field_record->>'defaultValue',
        COALESCE((field_record->>'required')::BOOLEAN, FALSE),
        COALESCE((field_record->>'disabled')::BOOLEAN, FALSE),
        COALESCE((field_record->>'readonly')::BOOLEAN, FALSE),
        field_index,
        COALESCE((field_record->>'span')::INT, 24),
        field_record->'options',
        field_record->'validators'
      );
      field_index := field_index + 1;
    END LOOP;
  END LOOP;
END $$;

-- Step 3: Remove the fields column from dynamic_form_configs
ALTER TABLE dynamic_form_configs DROP COLUMN IF EXISTS fields;

-- Step 4: Create workflow_templates table
CREATE TABLE IF NOT EXISTS workflow_templates (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  form_config_id INT NULL,
  default_priority workflow_priority DEFAULT 'medium',
  default_assignee_role_id INT NULL,
  estimated_duration INT,
  active BOOLEAN DEFAULT TRUE,
  created_by INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (form_config_id) REFERENCES dynamic_form_configs(id) ON DELETE SET NULL,
  FOREIGN KEY (default_assignee_role_id) REFERENCES roles(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_workflow_templates_code ON workflow_templates(code);
CREATE INDEX idx_workflow_templates_category ON workflow_templates(category);
CREATE INDEX idx_workflow_templates_active ON workflow_templates(active);

-- Step 5: Add template_id column to workflows table
ALTER TABLE workflows ADD COLUMN IF NOT EXISTS template_id INT NULL;
ALTER TABLE workflows ADD CONSTRAINT fk_workflows_template
  FOREIGN KEY (template_id) REFERENCES workflow_templates(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_workflows_template_id ON workflows(template_id);

-- Step 6: Add triggers for new tables
CREATE TRIGGER update_form_fields_updated_at
  BEFORE UPDATE ON form_fields
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workflow_templates_updated_at
  BEFORE UPDATE ON workflow_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Step 7: Insert sample workflow templates
INSERT INTO workflow_templates (code, name, description, category, default_priority, active, created_by)
VALUES
  ('LEAVE_REQUEST', 'Leave Request', 'Standard employee leave request workflow', 'HR', 'medium', true, 1),
  ('EXPENSE_REPORT', 'Expense Report', 'Employee expense reimbursement workflow', 'Finance', 'medium', true, 1),
  ('IT_SUPPORT', 'IT Support Ticket', 'IT support request workflow', 'IT', 'high', true, 1)
ON CONFLICT (code) DO NOTHING;

COMMIT;
