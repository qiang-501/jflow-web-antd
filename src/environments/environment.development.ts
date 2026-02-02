export const environment = {
  production: false,
  apiUrl: 'http://localhost:4200/api',
  fakeBackend: true,
  enableDebugMode: true,
  // 开发模式下默认用户为管理员
  isAdmin: true,
  // true: 使用Mock数据, false: 使用真实API (需配置proxy.conf.json代理到后端)
  useMockData: false,
};
