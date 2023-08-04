const path = require("path");
const fs = require("fs");
const loading = require("./loading");
const log = require("./log");

module.exports = async function (name, option) {
    // 当前目录
    const cwd = process.cwd();

    // 创建项目的地址
    const targetAir = path.join(cwd, name);

    // 判断文件夹是否存在
    if (fs.existsSync(targetAir)) {
        log.error(`Invalid project name: "${name}"`);
        return;
    }

    loading.start("Creating project...");
};
