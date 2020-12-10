import { fusebox, sparky } from 'fuse-box';
import {pluginTypeChecker} from 'fuse-box-typechecker';

import * as ts from "typescript";

const typeChecker = require('fuse-box-typechecker').TypeChecker({
    tsConfig: './tsconfig.json',
    basePath: './',
    name: 'checkerSync'
});

class Context {
    public getConfig(isProduction = false) {
        const plugins = []
        if(!isProduction) {
            plugins.push(pluginTypeChecker({
                name: 'Superman',
                tsConfig: './tsconfig.json'
            }))
        }

        return fusebox({
            logging: {
                level: 'verbose',
            },
            target: 'browser',
            entry: isProduction ? 'src/index.ts' : 'src/test.ts',
            webIndex: !isProduction && {
                template: 'src/index.html',
            },
            devServer: !isProduction && {
                hmrServer: {
                    enabled: true,
                },
            },
            cache: false,
            "hmr": !isProduction,
            plugins
        })
    }
}


const {
    rm,
    task,
    
} = sparky<Context>(Context)

task("default", async (ctx: Context) => {
    const fuse = ctx.getConfig(false)
    await fuse.runDev()
})

task('typecheck', () => {
    typeChecker.printSettings();
    typeChecker.inspectAndPrint();
    typeChecker.worker_watch('./src');
});

task("build", async (ctx: Context) => {
    console.log('prod')
    const fuse = ctx.getConfig(true)
    rm('./dist');
    await fuse.runProd({
        manifest: false,
        bundles: {
            app: 'index.js',
        },
    })
        .then(function() {
        // 
    })
})

