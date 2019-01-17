const path = require('path')
const fs = require('fs')

let allfiles = []
// 获取文件目录下面所有路径
getfilePath(__dirname)
function getfilePath(filePath) {
  let catalogfiles = fs.readdirSync(filePath) // 读取目录所有文件
  const excludefilename = ['README.md','.git','getdir.js']
  // 排除
  catalogfiles.forEach(file => {
    if(excludefilename.includes(file)) {
      console.log("fff", file)
      return
    }
    const absolutepath = path.resolve(filePath, file)
    const filestats = fs.statSync(absolutepath)
    if(filestats.isDirectory()) {
      return getfilePath(absolutepath)
    } else {
      allfiles.push(absolutepath)
    }
  })
}

// 所有文件的路径
let allfilsarr = getAllFileArr(allfiles)
function getAllFileArr(allfiles) {
  let relativePath = allfiles.map(paths => {
    return path.relative(__dirname, paths)
  })
  return relativePath
}


// 判断多层还是一层
const structs = {}
allfilsarr.forEach(filePath => {
  // 格式化路径为数组
  const fileArrs = filePath.split('/')
  let currentProp = eval('structs' + fileArrs.slice(0, -1).reduce((t, c) => {
    if (!eval('structs' + t + `['${c}']`)) {
      eval('structs' + t + `['${c}']` + '= {}')
    }
    return t + `['${c}']`
  }, ''))
  if (currentProp._children) {
    currentProp._children.push(fileArrs.slice(-1)[0])
  } else {
    currentProp._children = fileArrs.slice(-1)
  }
})
console.log("噶啥风格大嘎达发布v", structs)

// 输出

let readmeContent =formatLink(structs, '', 1)
console.log("嘎嘎嘎嘎嘎", Object.keys(structs))
function formatLink(obj, basePath,level) {
  let readmeContent = ''
  Object.keys(obj).forEach(k => {
    if (k === '_children') {
      // 这个是针对根目录下存在的独立文件
      return readmeContent += obj[k].reduce((t, c) => t + `- [${c}](/${c})\n`, '')
    }
    // readmeContent += ('\t'.repeat(level - 1) + `- [${k}](${basePath}/${k})\n`)
    // 如果存在子层级，则遍历子层级
    if (obj[k]._children) {
      readmeContent += obj[k]._children.reduce((t, c) => {
        return t + '\t'.repeat(level) + `- [${c}](${basePath}/${k}/${c})\n`
      }, '')
    }
    const objKeys = Object.keys(obj[k])
    // 如果子层级存在并且不止一个，或者子层级只有一个但属性名不是 _children
    if (objKeys.length > 1 || (objKeys.length && objKeys[0] !== '_children')) {
      const tempObj = {}
      objKeys.filter(d1 => d1 !== '_children').forEach(d2 => {
        tempObj[d2] = obj[k][d2]
      })
      return formatLink(tempObj, `${basePath}/${k}`, level + 1)
    }
  })
  return readmeContent
}
console.log("??????????",readmeContent)

fs.writeFile(path.resolve(__dirname, 'README.md'), readmeContent, ()=> {
  console.log("成功")
})