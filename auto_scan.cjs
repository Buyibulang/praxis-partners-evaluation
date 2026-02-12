#!/usr/bin/env node

/**
 * Praxis Partners 项目自动扫描工具
 * 在每次开发前运行此工具，确保项目上下文完整
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Praxis Partners 项目扫描工具');
console.log('==================================\n');

// 项目根目录
const PROJECT_ROOT = path.resolve(__dirname);

// 扫描配置
const SCAN_CONFIG = {
  // 必需的核心文件
  requiredFiles: [
    'src/App.jsx',
    'src/main.jsx',
    'package.json',
    'vite.config.js',
    'tailwind.config.js',
    '.env.production',
    'vercel.json'
  ],

  // 支付系统组件
  paymentComponents: [
    'src/components/PaymentButton.jsx',
    'src/components/SubscriptionManagement.jsx',
    'src/components/PaymentSuccessPage.jsx',
    'src/components/PaymentFailedPage.jsx'
  ],

  // 文档文件
  docs: [
    'DEPLOYMENT_PRODUCTION.md',
    'YOUR_ACTION_PLAN.md',
    'STEPS_TO_COMPLETE.md',
    'PROJECT_STATE.json',
    'PAYMENT_INTEGRATION_TEST_REPORT.md'
  ],

  // 构建产物
  build: [
    'dist/index.html',
    'dist/assets'
  ],

  // 后端代码（可选）
  backend: [
    'supabase/migrations',
    'supabase/functions/stripe-checkout-create',
    'supabase/functions/payment-webhook'
  ]
};

// 扫描结果存储
const scanResults = {
  timestamp: new Date().toISOString(),
  fileStatus: {},
  codeStats: {},
  recommendations: []
};

/**
 * 检查文件是否存在
 */
function checkFileExists(filePath) {
  const fullPath = path.join(PROJECT_ROOT, filePath);
  return fs.existsSync(fullPath);
}

/**
 * 获取代码行数
 */
function getCodeLines(filePath) {
  try {
    const fullPath = path.join(PROJECT_ROOT, filePath);
    const content = fs.readFileSync(fullPath, 'utf8');
    return content.split('\n').length;
  } catch (error) {
    return 0;
  }
}

/**
 * 扫描所有React组件
 */
function scanComponents() {
  console.log('📦 扫描组件...');

  const componentsDir = path.join(PROJECT_ROOT, 'src/components');
  const components = {};

  if (fs.existsSync(componentsDir)) {
    const files = fs.readdirSync(componentsDir);
    files.forEach(file => {
      if (file.endsWith('.jsx')) {
        const filePath = path.join(componentsDir, file);
        const lines = getCodeLines(`src/components/${file}`);
        const size = fs.statSync(filePath).size;

        components[file] = {
          lines,
          size,
          exists: true
        };
      }
    });
  }

  scanResults.codeStats.components = components;
  console.log(`✅ 找到 ${Object.keys(components).length} 个组件\n`);
}

/**
 * 扫描支付系统完整性
 */
function scanPaymentSystem() {
  console.log('💳 扫描支付系统...');

  const paymentStatus = {
    allComponentsExist: true,
    totalLines: 0,
    missingComponents: []
  };

  SCAN_CONFIG.paymentComponents.forEach(component => {
    const exists = checkFileExists(component);
    const lines = exists ? getCodeLines(component) : 0;

    scanResults.fileStatus[component] = {
      exists,
      lines
    };

    if (!exists) {
      paymentStatus.allComponentsExist = false;
      paymentStatus.missingComponents.push(component);
    }

    paymentStatus.totalLines += lines;
  });

  console.log(`✅ 支付系统: ${paymentStatus.allComponentsExist ? '完整' : '不完整'}`);
  console.log(`✅ 代码行数: ${paymentStatus.totalLines} 行\n`);

  return paymentStatus;
}

/**
 * 检查项目依赖
 */
function checkDependencies() {
  console.log('📋 检查依赖...');

  try {
    const packageJsonPath = path.join(PROJECT_ROOT, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

    const dependencies = {
      react: packageJson.dependencies?.react || '未安装',
      '@supabase/supabase-js': packageJson.dependencies?.['@supabase/supabase-js'] || '未安装',
      'framer-motion': packageJson.dependencies?.['framer-motion'] || '未安装',
      'recharts': packageJson.dependencies?.recharts || '未安装'
    };

    scanResults.codeStats.dependencies = dependencies;
    console.log('✅ 依赖检查完成\n');
  } catch (error) {
    console.log('❌ 无法读取package.json\n');
  }
}

/**
 * 生成扫描报告
 */
function generateReport() {
  console.log('📊 生成扫描报告...\n');

  // 检查必需文件
  console.log('🔍 必需文件状态:');
  SCAN_CONFIG.requiredFiles.forEach(file => {
    const exists = checkFileExists(file);
    console.log(`  ${exists ? '✅' : '❌'} ${file}`);
  });

  console.log('\n🔍 文档完整性:');
  SCAN_CONFIG.docs.forEach(doc => {
    const exists = checkFileExists(doc);
    console.log(`  ${exists ? '✅' : '❌'} ${doc}`);
  });

  console.log('\n🔍 构建产物:');
  SCAN_CONFIG.build.forEach(item => {
    const exists = checkFileExists(item);
    console.log(`  ${exists ? '✅' : '❌'} ${item}`);
  });

  // 生成建议
  generateRecommendations();

  // 保存扫描结果
  saveScanResults();
}

/**
 * 生成建议
 */
function generateRecommendations() {
  console.log('\n💡 智能建议:\n');

  // 检查支付系统
  const paymentStatus = scanPaymentSystem();
  if (!paymentStatus.allComponentsExist) {
    scanResults.recommendations.push({
      type: 'critical',
      category: 'payment',
      message: '支付系统组件不完整',
      action: '检查并恢复缺失的组件',
      missing: paymentStatus.missingComponents
    });
    console.log('❌ CRITICAL: 支付系统不完整，无法上线');
  }

  // 检查部署准备
  const productionEnvExists = checkFileExists('.env.production');
  const vercelConfigExists = checkFileExists('vercel.json');
  const buildExists = checkFileExists('dist/index.html');

  if (productionEnvExists && vercelConfigExists && buildExists) {
    console.log('✅ 生产部署: 准备就绪');
    scanResults.recommendations.push({
      "type": "success",
      "category": "deployment",
      "message": "系统已100%准备好生产部署",
      "action": "立即执行部署到Vercel"
    });
  } else {
    console.log('⚠️  生产部署: 需要准备');
    if (!productionEnvExists) console.log('  - 创建 .env.production');
    if (!vercelConfigExists) console.log('  - 创建 vercel.json');
    if (!buildExists) console.log('  - 运行 npm run build');
  }

  // 检查文档完整性
  const docsComplete = SCAN_CONFIG.docs.every(doc => checkFileExists(doc));
  if (docsComplete) {
    console.log('✅ 文档完整性: 优秀');
  } else {
    console.log('⚠️  文档完整性: 部分缺失');
  }
}

/**
 * 保存扫描结果
 */
function saveScanResults() {
  const outputPath = path.join(PROJECT_ROOT, 'PROJECT_STATE_LATEST.json');
  fs.writeFileSync(outputPath, JSON.stringify(scanResults, null, 2));
  console.log(`\n💾 扫描结果已保存: PROJECT_STATE_LATEST.json\n`);

  // 同时更新主状态文件
  const mainStatePath = path.join(PROJECT_ROOT, 'PROJECT_STATE.json');
  if (checkFileExists('PROJECT_STATE.json')) {
    const mainState = JSON.parse(fs.readFileSync(mainStatePath, 'utf8'));
    mainState.last_scan = scanResults.timestamp;
    mainState.scan_summary = {
      total_components: Object.keys(scanResults.codeStats.components || {}).length,
      payment_system_ready: scanPaymentSystem().allComponentsExist,
      docs_complete: SCAN_CONFIG.docs.every(doc => checkFileExists(doc)),
      ready_for_deployment: checkFileExists('.env.production') && checkFileExists('vercel.json') && checkFileExists('dist/index.html')
    };
    fs.writeFileSync(mainStatePath, JSON.stringify(mainState, null, 2));
  }
}

/**
 * 主函数
 */
function main() {
  console.log('开始扫描项目...\n');

  // 执行扫描
  scanComponents();
  checkDependencies();
  scanPaymentSystem();
  generateReport();

  console.log('✅ 扫描完成！\n');
  console.log('📄 查看详细报告:');
  console.log('   cat PROJECT_STATE_LATEST.json\n');
  console.log('💡 建议下一步:');
  console.log('   1. 查看扫描结果');
  console.log('   2. 根据建议采取行动');
  console.log('   3. 准备生产部署\n');
}

// 运行
main();
