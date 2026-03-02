/**
 * JWT 配置常量
 * 确保整个应用使用相同的 JWT 密钥
 */

// 从环境变量读取 JWT 配置，使用默认值作为后备
export const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '2h';

// 添加日志以便调试
console.log('🔑 [JWT Config] JWT_SECRET:', JWT_SECRET);
console.log('⏱️  [JWT Config] JWT_EXPIRES_IN:', JWT_EXPIRES_IN);
