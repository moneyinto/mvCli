#! /usr/bin/env node
const { Command } = require("commander");
const create = require("../lib/create");

const program = new Command();

// 定义创建项目
program
    .command("create <projectName>")
    .description("create a new project")
    .action((name, option) => {
        // 打印结果，输出用户手动输入的项目名字
        console.log("name:", name, "option:", option);
        create(name, option);
    });

// 配置版本信息
program
    .version(`${require("../package.json").version}`)
    .usage("<command> [option]");

// 解析用户执行命令传入参数
program.parse(process.argv);
