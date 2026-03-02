-- ================================================================
-- 测试 API: /api/permissions/current-user
-- 这个脚本插入测试数据以验证 API 功能
-- ================================================================

-- 1. 创建测试用户（如果不存在）
INSERT INTO users (username, password, email, full_name, status)
VALUES
  ('testuser', '$2b$10$abcdefghijklmnopqrstuvwxyz1234567890', 'test@example.com', '测试用户', 'active')
ON CONFLICT (username) DO NOTHING;

-- 2. 创建测试角色
INSERT INTO roles (name, description, status)
VALUES
  ('Workflow Manager', '工作流管理员，拥有所有工作流相关权限', 'active'),
  ('User Viewer', '用户查看者，只能查看用户信息', 'active')
ON CONFLICT (name) DO NOTHING;

-- 3. 创建测试权限
INSERT INTO permissions (code, name, type, description, resource, action)
VALUES
  -- 工作流权限
  ('workflow:create', '创建工作流', 'action', '允许创建新的工作流', 'workflow', 'create'),
  ('workflow:update', '更新工作流', 'action', '允许更新工作流信息', 'workflow', 'update'),
  ('workflow:delete', '删除工作流', 'action', '允许删除工作流', 'workflow', 'delete'),
  ('workflow:view', '查看工作流', 'action', '允许查看工作流列表和详情', 'workflow', 'view'),
  ('workflow:change_status', '修改工作流状态', 'action', '允许修改工作流状态', 'workflow', 'change_status'),

  -- 用户权限
  ('user:create', '创建用户', 'action', '允许创建新用户', 'user', 'create'),
  ('user:update', '更新用户', 'action', '允许更新用户信息', 'user', 'update'),
  ('user:delete', '删除用户', 'action', '允许删除用户', 'user', 'delete'),
  ('user:view', '查看用户', 'action', '允许查看用户列表和详情', 'user', 'view'),

  -- 角色权限
  ('role:create', '创建角色', 'action', '允许创建新角色', 'role', 'create'),
  ('role:update', '更新角色', 'action', '允许更新角色信息', 'role', 'update'),
  ('role:delete', '删除角色', 'action', '允许删除角色', 'role', 'delete'),
  ('role:view', '查看角色', 'action', '允许查看角色列表和详情', 'role', 'view'),

  -- 表单权限
  ('form:manage', '管理表单', 'action', '允许创建、编辑和删除动态表单', 'form', 'manage')
ON CONFLICT (code) DO NOTHING;

-- 4. 将权限分配给角色
-- Workflow Manager 拥有所有工作流权限 + 表单管理权限
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'Workflow Manager'
  AND p.code IN (
    'workflow:create',
    'workflow:update',
    'workflow:delete',
    'workflow:view',
    'workflow:change_status',
    'form:manage'
  )
ON CONFLICT DO NOTHING;

-- User Viewer 只能查看用户
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'User Viewer'
  AND p.code IN ('user:view')
ON CONFLICT DO NOTHING;

-- 5. 将角色分配给测试用户
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u
CROSS JOIN roles r
WHERE u.username = 'testuser'
  AND r.name IN ('Workflow Manager', 'User Viewer')
ON CONFLICT DO NOTHING;

-- 6. 验证查询：查看测试用户的所有权限
SELECT
  u.username,
  u.email,
  r.name as role_name,
  p.code as permission_code,
  p.name as permission_name
FROM users u
JOIN user_roles ur ON ur.user_id = u.id
JOIN roles r ON r.id = ur.role_id
JOIN role_permissions rp ON rp.role_id = r.id
JOIN permissions p ON p.id = rp.permission_id
WHERE u.username = 'testuser'
ORDER BY r.name, p.code;

-- 7. 测试 API 查询（使用用户ID）
-- 获取用户ID
SELECT id, username, email FROM users WHERE username = 'testuser';

-- 预期结果：
-- 测试用户应该拥有以下权限：
-- - workflow:create
-- - workflow:update
-- - workflow:delete
-- - workflow:view
-- - workflow:change_status
-- - form:manage
-- - user:view

-- ================================================================
-- 测试 API 调用示例
-- ================================================================

/*
使用 curl 测试：

# 假设测试用户的ID是1
curl -X GET "http://localhost:3000/api/permissions/current-user" \
  -H "user-id: 1" \
  -H "Content-Type: application/json"

# 或使用查询参数
curl -X GET "http://localhost:3000/api/permissions/current-user?userId=1" \
  -H "Content-Type: application/json"

# 预期响应：
# [
#   "workflow:create",
#   "workflow:update",
#   "workflow:delete",
#   "workflow:view",
#   "workflow:change_status",
#   "form:manage",
#   "user:view"
# ]
*/

-- ================================================================
-- 清理测试数据（如果需要）
-- ================================================================

/*
-- 取消注释以下语句来清理测试数据

-- 删除用户角色关联
DELETE FROM user_roles
WHERE user_id IN (SELECT id FROM users WHERE username = 'testuser');

-- 删除角色权限关联
DELETE FROM role_permissions
WHERE role_id IN (SELECT id FROM roles WHERE name IN ('Workflow Manager', 'User Viewer'));

-- 删除测试角色
DELETE FROM roles WHERE name IN ('Workflow Manager', 'User Viewer');

-- 删除测试权限
DELETE FROM permissions WHERE code LIKE 'workflow:%' OR code LIKE 'user:%' OR code LIKE 'role:%' OR code LIKE 'form:%';

-- 删除测试用户
DELETE FROM users WHERE username = 'testuser';
*/
