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
    // 直接使用 execSync 会堵塞影响 loading动画
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
