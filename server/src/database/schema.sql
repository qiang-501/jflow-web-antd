-- JFlow Database Schema
-- PostgreSQL 12+

-- Create database (run this command separately in psql)
-- CREATE DATABASE jflow WITH ENCODING 'UTF8';
-- \c jflow;

-- Create ENUM types
CREATE TYPE user_status AS ENUM ('active', 'inactive', 'locked');
CREATE TYPE permission_type AS ENUM ('menu', 'action', 'api');
CREATE TYPE workflow_status AS ENUM ('draft', 'pending', 'in_progress', 'completed', 'rejected', 'cancelled');
CREATE TYPE workflow_priority AS ENUM ('low', 'medium', 'high', 'urgent');

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  full_name VARCHAR(100),
  status user_status DEFAULT 'active',
  last_login TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_status ON users(status);

-- Roles table
CREATE TABLE IF NOT EXISTS roles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  code VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  parent_id INT NULL,
  level INT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES roles(id) ON DELETE SET NULL
);

CREATE INDEX idx_roles_code ON roles(code);
CREATE INDEX idx_roles_parent_id ON roles(parent_id);

-- Permissions table
CREATE TABLE IF NOT EXISTS permissions (
  id SERIAL PRIMARY KEY,
  code VARCHAR(100) NOT NULL UNIQUE,
  name VARCHAR(200) NOT NULL,
  type permission_type DEFAULT 'action',
  description TEXT,
  resource VARCHAR(200),
  action VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_permissions_code ON permissions(code);
CREATE INDEX idx_permissions_type ON permissions(type);
CREATE INDEX idx_permissions_resource ON permissions(resource);

-- User-Role junction table
CREATE TABLE IF NOT EXISTS user_roles (
  user_id INT NOT NULL,
  role_id INT NOT NULL,
  PRIMARY KEY (user_id, role_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);

-- Role-Permission junction table
CREATE TABLE IF NOT EXISTS role_permissions (
  role_id INT NOT NULL,
  permission_id INT NOT NULL,
  PRIMARY KEY (role_id, permission_id),
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
  FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
);

-- Dynamic form configs table
CREATE TABLE IF NOT EXISTS dynamic_form_configs (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  fields JSONB NOT NULL,
  layout VARCHAR(50) DEFAULT 'vertical',
  label_width VARCHAR(50),
  label_align VARCHAR(50) DEFAULT 'right',
  version INT DEFAULT 1,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_form_configs_name ON dynamic_form_configs(name);
CREATE INDEX idx_form_configs_active ON dynamic_form_configs(active);

-- Workflows table
CREATE TABLE IF NOT EXISTS workflows (
  id SERIAL PRIMARY KEY,
  d_workflow_id VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  status workflow_status DEFAULT 'draft',
  priority workflow_priority DEFAULT 'medium',
  form_config_id INT NULL,
  created_by INT NULL,
  assigned_to INT NULL,
  due_date TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (form_config_id) REFERENCES dynamic_form_configs(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_workflows_d_workflow_id ON workflows(d_workflow_id);
CREATE INDEX idx_workflows_status ON workflows(status);
CREATE INDEX idx_workflows_priority ON workflows(priority);
CREATE INDEX idx_workflows_created_by ON workflows(created_by);
CREATE INDEX idx_workflows_assigned_to ON workflows(assigned_to);

-- Workflow history table
CREATE TABLE IF NOT EXISTS workflow_history (
  id SERIAL PRIMARY KEY,
  workflow_id INT NOT NULL,
  action VARCHAR(100) NOT NULL,
  comment TEXT,
  old_status VARCHAR(50),
  new_status VARCHAR(50),
  performed_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (workflow_id) REFERENCES workflows(id) ON DELETE CASCADE,
  FOREIGN KEY (performed_by) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_workflow_history_workflow_id ON workflow_history(workflow_id);
CREATE INDEX idx_workflow_history_created_at ON workflow_history(created_at);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_roles_updated_at BEFORE UPDATE ON roles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_permissions_updated_at BEFORE UPDATE ON permissions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_form_configs_updated_at BEFORE UPDATE ON dynamic_form_configs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_workflows_updated_at BEFORE UPDATE ON workflows FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
