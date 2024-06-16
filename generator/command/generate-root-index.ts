import * as fs from 'fs'
import * as path from 'path'

const directoryPath = path.join(__dirname, '../../src')
const indexFile = path.join(directoryPath, 'index.ts')

let importStatements = ''
const moduleNames: string[] = []

function kebabToCamel(s: string) {
    return s.replace(/(-\w)|(\.\w)/g, function (m) {
        return m[1].toUpperCase()
    })
}

function scanDirectory(directory: string) {
    const files = fs.readdirSync(directory)

    files.forEach(function (file) {
        const fullPath = path.join(directory, file)
        const stat = fs.statSync(fullPath)

        if (stat.isDirectory()) {
            scanDirectory(fullPath)
        } else if (path.extname(file) === '.ts' && file !== 'index.ts') {
            const relativePath = path.relative(directoryPath, fullPath).replace(/\\/g, '/')
            let fileNameWithoutExtension = path.basename(relativePath, '.ts')
            if (fileNameWithoutExtension !== 'index') {
                fileNameWithoutExtension = kebabToCamel(fileNameWithoutExtension) // convert kebab-case to camelCase
                const importPath = './' + relativePath.substring(0, relativePath.length - 3) // remove .ts from the end
                importStatements += `import * as ${fileNameWithoutExtension} from '${importPath}';\n`
                moduleNames.push(fileNameWithoutExtension)
            }
        }
    })
}

scanDirectory(directoryPath)

const exportStatement = 'export {\n' + moduleNames.join(',\n') + '\n};\n'

fs.writeFile(indexFile, importStatements + exportStatement, function (err) {
    if (err) {
        return console.log(err)
    }
})
