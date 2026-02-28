/**
 * 检查应用是否正在运行
 * 在运行测试之前使用此脚本验证应用状态
 */

const http = require("http");

const APP_URL = "http://localhost:4200";
const timeout = 5000;

console.log("检查应用状态...");
console.log(`URL: ${APP_URL}`);
console.log("---");

const checkApp = () => {
  return new Promise((resolve, reject) => {
    const req = http.get(APP_URL, (res) => {
      if (res.statusCode === 200) {
        console.log("✅ 应用正在运行");
        console.log(`状态码: ${res.statusCode}`);
        resolve(true);
      } else {
        console.log("⚠️  应用返回异常状态码");
        console.log(`状态码: ${res.statusCode}`);
        resolve(false);
      }
    });

    req.on("error", (err) => {
      console.log("❌ 应用未运行或无法连接");
      console.log(`错误: ${err.message}`);
      console.log("");
      console.log("请先启动应用：");
      console.log("  cd c:\\code\\open-source\\jflow-web-antd");
      console.log("  npm start");
      resolve(false);
    });

    req.setTimeout(timeout, () => {
      req.destroy();
      console.log("❌ 连接超时");
      resolve(false);
    });
  });
};

checkApp().then((isRunning) => {
  if (isRunning) {
    console.log("");
    console.log("✨ 可以开始运行测试了！");
    console.log("运行命令: npm test");
    process.exit(0);
  } else {
    process.exit(1);
  }
});
