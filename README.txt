# 题库练习（修订版）
开箱即用：双击 `index.html` 即可在浏览器中运行。

## 文件说明
- `index.html`：示例页面（已按正确顺序加载题库与脚本）。
- `questions_data_fixed.js`：修订后的题库（非模块，提供全局 `quizData`）。
- `script.js`：你的现有逻辑脚本（按全局 `quizData` 读取题库）。

## 如需 ES Module 用法
- 改用 `questions_data_fixed.esm.js`，并在 `script.js` 顶部写：
  `import quizData from './questions_data_fixed.esm.js';`
- 然后用 `<script type="module" src="./script.js"></script>` 加载。

## 常见问题
- 控制台 `quizData is not defined`：说明加载顺序不对或用了 `type="module"`。
- Service Worker 缓存导致内容不更新：强制刷新或注销 SW。
