-- Migration: Add workflow_form_data table
-- Date: 2024-12-05
-- Description: Create table to store workflow dynamic form submission data

-- Create workflow_form_data table
CREATE TABLE IF NOT EXISTS workflow_form_data (
  id SERIAL PRIMARY KEY,
  workflow_id INT NOT NULL UNIQUE,
  form_config_id INT NOT NULL,
  form_data JSONB NOT NULL,
  submitted_by INT NULL,
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (workflow_id) REFERENCES workflows(id) ON DELETE CASCADE,
  FOREIGN KEY (form_config_id) REFERENCES dynamic_form_configs(id) ON DELETE CASCADE,
  FOREIGN KEY (submitted_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_workflow_form_data_workflow_id ON workflow_form_data(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_form_data_form_config_id ON workflow_form_data(form_config_id);
CREATE INDEX IF NOT EXISTS idx_workflow_form_data_submitted_at ON workflow_form_data(submitted_at);

-- Create trigger for updated_at
CREATE TRIGGER update_workflow_form_data_updated_at
  BEFORE UPDATE ON workflow_form_data
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data (optional - comment out if not needed)
/*
INSERT INTO workflow_form_data (workflow_id, form_config_id, form_data, submitted_by)
VALUES
  (1, 1, '{"leaveType": "annual", "startDate": "2024-12-20", "endDate": "2024-12-22", "reason": "家庭事务需要处理"}', 1),
  (2, 2, '{"itemName": "MacBook Pro 16寸", "quantity": 2, "estimatedPrice": 18000, "urgency": "urgent", "description": "开发团队需要两台高性能笔记本电脑用于项目开发"}', 1),
  (3, 1, '{"leaveType": "sick", "startDate": "2024-12-01", "endDate": "2024-12-02", "reason": "感冒发烧，需要休息"}', 2);
*/

COMMENT ON TABLE workflow_form_data IS '工作流动态表单数据表';
COMMENT ON COLUMN workflow_form_data.id IS '主键ID';
COMMENT ON COLUMN workflow_form_data.workflow_id IS '关联的工作流ID';
COMMENT ON COLUMN workflow_form_data.form_config_id IS '关联的表单配置ID';
COMMENT ON COLUMN workflow_form_data.form_data IS '表单数据(JSON格式)';
COMMENT ON COLUMN workflow_form_data.submitted_by IS '提交用户ID';
COMMENT ON COLUMN workflow_form_data.submitted_at IS '提交时间';
COMMENT ON COLUMN workflow_form_data.updated_at IS '最后更新时间';
