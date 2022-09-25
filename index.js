#!/usr/bin/env node
import { resolve } from "node:path"
import { readdir, stat } from "node:fs/promises"
import sade from "sade"
import pkg from './package.json' assert { type: 'json' }
import { writeFile } from "node:fs/promises"

const cwd = process.cwd()
const program = sade('vscode-workspace-gen', true)

const data = {
    folders: [],
    settings: {}
}

program
    .version(pkg.version)
    .describe('Generates a workspace file for usage with Visual Studio Code.')
    .option('--dry-run', 'Runs a simulation without actually doing anything.')
    .option('-b, --base-directory', 'The directory to scan.', cwd)
    .option('-i, --indentation', 'The indentation size of the result file.', 4)
    .option('-n, --name', 'The workspace name.', 'workspace')
    .option('-O, --output-directory', 'Where to put the result data.', cwd)
    .option('-s, --settings', 'A settings file to use.', cwd + '/.vscode/settings.json')
    .action(async (opts) => {
        const dirs = await readdir(opts.b)
        for (const dir of dirs) {
            const fullDir = resolve(opts.b, dir)
            const stats = await stat(fullDir)
            if (! stats.isDirectory()) {
                continue
            }

            data.folders.push({
                name: dir,
                path: fullDir
            })
        }

        const outFile = resolve(opts.O, `${opts.n}.code-workspace`)
        await writeFile(outFile, JSON.stringify(data, null, opts.i))
    })
    .parse(process.argv)
