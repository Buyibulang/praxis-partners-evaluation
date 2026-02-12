// 支付系统集成测试脚本
const puppeteer = require('puppeteer');

(async () => {
  console.log('🚀 开始测试支付系统集成的完整流程...\n');
  
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    // 测试1: 访问首页并检查QuotaStatus
    console.log('📋 测试1: 访问首页并检查QuotaStatus');
    await page.goto('http://localhost:3000');
    await page.waitForSelector('text/本月评估');
    console.log('✅ QuotaStatus组件正常加载');
    
    // 测试2: 直接访问支付成功页面
    console.log('\n📋 测试2: 直接访问支付成功页面');
    await page.goto('http://localhost:3000/?payment=success&plan=pro');
    await page.waitForSelector('text/支付成功');
    console.log('✅ 支付成功页面正常加载');
    
    // 测试3: 直接访问支付失败页面
    console.log('\n📋 测试3: 直接访问支付失败页面');
    await page.goto('http://localhost:3000/?payment=failed');
    await page.waitForSelector('text/支付失败');
    console.log('✅ 支付失败页面正常加载');
    
    // 测试4: 测试SubscriptionManagement组件（需要手动点击）
    console.log('\n📋 测试4: 订阅管理组件');
    await page.goto('http://localhost:3000');
    console.log('请手动点击"管理订阅"按钮进行测试');
    
    console.log('\n🎉 所有自动化测试通过！');
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
  
  // await browser.close();
})();
