## 脚手架


### 使用

- #### 方法一
通过将脚手架上传到npm，然后进行全局安装

```shell
# 安装
npm i -g @moneyinto/mvcli

# 查看版本
mvcli --version

# 创建项目
mvcli create my-project
```

- #### 方法二
通过github直接下载脚手架

```shell
# 下载项目
git clone https://github.com/moneyinto/mvCli.git

# 进入到项目
cd mvCli

# 安装依赖
npm i

# 创建连接
npm link

# 创建项目
mvcli create my-project

# 取消连接
npm unlink
```

### 项目实现

- 创建cli项目
```shell
# 创建项目文件夹
mkdir mvCli

# 初始化 package.json
npm init
```

- 文件目录

```
// 创建 bin 文件夹，添加启动文件 cli.js

└── mvCli
    ├── bin
    |   └── cli.js
    ├── lib
    |   ├── create.js       // 主要文件实现
    |   ├── loading.js      // spinner
    |   └── log.js          // 日志输出
    ├── package.json
    └── README.md
```

- 编写命令

通过[commander.js](https://github.com/tj/commander.js/blob/HEAD/Readme_zh-CN.md)来实现编写

```shell
# 安装 commander
npm install commander
```
```javascript
// cli.js
// 在 cli.js 文件开头要加上识别 #! /usr/bin/env node
#! /usr/bin/env node
const { Command } = require("commander");
const create = require("../lib/create");

const program = new Command();

// 定义创建项目
program
    .command("create <projectName>")
    .description("create a new project")
    .action((name, option) => {
        create(name, option);
    });

// 配置版本信息
program
    .version(`${require("../package.json").version}`)
    .usage("<command> [option]");

// 解析用户执行命令传入参数
program.parse(process.argv);
```

通过创建链接`npm link`进行调试

```shell
mvcli

# 输出结果
Usage: mvcli <command> [option]

Options:
  -V, --version         output the version number
  -h, --help            display help for command

Commands:
  create <projectName>  create a new project
  help [command]        display help for command

# 查看版本号
mvcli ==version

# 输出结果
1.0.0
```

- 封装loading
```javascript
const ora = require("ora");
const chalk = require("chalk");

const spinner = ora();

const start = (msg) => {
    spinner.text = chalk.blue(msg);
    spinner.start();
};

const success = (msg) => {
    spinner.stopAndPersist({
        symbol: chalk.green("✔"),
        text: chalk.green(msg)
    });
};

const stop = () => {
    spinner.stop();
};

const error = (msg) => {
    spinner.fail(chalk.red(msg));
};

module.exports = {
    start,
    stop,
    success,
    error
};
```

***【注意】`ora`、`chalk` 依赖最新版只支持ESModule格式，使用`require`会报错，要么限定使用`ndoe 16`版本，都使用`import`导入，要么安装`ora@5.x`、`chalk@4.x`版本***

- 封装log
  
```javascript
const chalk = require("chalk");

const info = (msg) => {
    console.log(chalk.blue(msg));
};

const success = (msg) => {
    console.log(chalk.green(msg));
};

const error = (msg) => {
    console.log(chalk.red(msg));
};

const warning = (msg) => {
    console.log(chalk.yellow(msg));
};

module.exports = {
    info,
    success,
    warning,
    error
};
```

- 编写create

```javascript
const path = require("path");
const fs = require("fs");
const child_process = require("child_process");
const loading = require("./loading");
const log = require("./log");

const projectUrl = "https://github.com/moneyinto/admin-vite-vue.git";

const exec = (command) => {
    return new Promise((resolve, reject) => {
        try {
            child_process.exec(command, (err) => {
                if (err) reject(false);
                else resolve(true);
            });
        } catch (e) {
            reject(false);
        }
    });
};

module.exports = async function (name, option) {
    // 当前目录
    const cwd = process.cwd();

    // 创建项目的地址
    const targetDir = path.join(cwd, name);

    // 判断文件夹是否存在
    if (fs.existsSync(targetDir)) {
        log.error(`Invalid project name: "${name}"`);
        return;
    }

    loading.start(`Download project...`);

    // TODO
    // 这里可以通过让用户选择组合，指定到对应的分支代码进行下载
    // 下载git仓库代码
    // 直接使用 execSync 会堵塞影响 loading动画, 所以使用 exec 将方法抽离
    const downloadResult = await exec(`git clone -b master ${projectUrl} ${targetDir}`);
    if (downloadResult) {
        loading.success(`Download project in ${targetDir}`);
    } else {
        return loading.error("Download project failed");
    }

    // 考虑上面项目通过zip下载解压
    // 移除项目中的 .git
    await exec(`rm -rf ${targetDir}/.git`);

    loading.start(`Installing additional dependencies...`);
    // 安装依赖
    const installResult = await exec(`cd ${targetDir} && npm install`);
    if (installResult) {
        loading.success(`Installing additional dependencies success`)
    } else {
        return loading.error("Installing additional dependencies failed");
    }

    log.success(`Successfully created project ${name}`);

    log.info(`$ cd ${name}`);
    log.info(`$ npm run dev`);
};
```

### 思考
- 目前没有进度用户配置选择，可以使用`inquirer`进行进一步完善优化
- 目前没有进度展示，用户体验感上略差，考虑使用`progress-estimator`来实现进度，但是关于`node_modules`的下载进度监听，没想到方案，要去读`vuecli`的源码了，有朋友知道，谢谢评论或提issue指教
- 进一步优化脚手架功能，比如`mvcli newPage <pageName>`, 这个可以参考`@ionic/cli`