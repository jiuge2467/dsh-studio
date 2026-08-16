import fs from 'node:fs'
import path from 'node:path'
import { execSync } from 'node:child_process'

const rootDir = 'E:\\ccode\\vscode_code\\个人项目\\dsh-mascot-pet'
const targetZip = 'E:\\ccode\\vscode_code\\个人项目\\dsh-mascot-pet.zip'
const stagingDir = 'E:\\ccode\\vscode_code\\个人项目\\_temp_dsh_mascot_pet'

// 1. 清理旧产物与暂存目录
if (fs.existsSync(targetZip)) {
  fs.unlinkSync(targetZip)
}
if (fs.existsSync(stagingDir)) {
  fs.rmSync(stagingDir, { recursive: true, force: true })
}
fs.mkdirSync(stagingDir, { recursive: true })

// 2. 复制需要分发的源码、编译产物与元数据
const includeList = [
  'lib',
  'src',
  'docs',
  'scripts',
  'tests',
  'package.json',
  'dsh.plugin.json',
  'cordis.patch.yml',
  'README.md',
  'README.zh-CN.md',
  'LICENSE',
  'tsconfig.json',
  'tsconfig.build.json',
  'tsdown.config.ts',
  'vitest.config.ts',
]

for (const item of includeList) {
  const srcPath = path.join(rootDir, item)
  const destPath = path.join(stagingDir, item)
  if (fs.existsSync(srcPath)) {
    fs.cpSync(srcPath, destPath, { recursive: true })
  }
}

// 3. 执行压缩
const psCommand = `Compress-Archive -Path '${stagingDir}\\*' -DestinationPath '${targetZip}' -CompressionLevel Optimal`
execSync(`powershell -NoProfile -Command "${psCommand}"`, { stdio: 'inherit' })

// 4. 清理暂存目录
fs.rmSync(stagingDir, { recursive: true, force: true })

const stat = fs.statSync(targetZip)
console.log(`[ZIP SUCCESS] ${targetZip} created successfully (${(stat.size / 1024).toFixed(2)} KB).`)
