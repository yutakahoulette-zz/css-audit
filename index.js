#!/usr/bin/env node
const fs = require('fs')
const commander = require('commander')
const getCss = require('get-css')
const reg = require('./utils/regexes')
const cleanSplit = require('./utils/cleanSplit')
const cleanReplace = require('./utils/cleanReplace')

const ENCODING = 'utf8'
const WRITE_PATH = 'demo/data.json'

const sortByCount = obj => {
  const sortedKeys = Object.keys(obj).sort((a, b) => {
    const countA = obj[a].count
    const countB = obj[b].count
    if (countA > countB) {
      return -1
    }
    if (countA < countB) {
      return 1
    }
    return 0
  })

  return sortedKeys.map(key => {
    const data = obj[key]
    return {
      rule: key,
      count: data.count,
      selectors: data.selectors
    }
  })
}

const countRules = (css='') => {
  const blocks = cleanSplit(css, '}')
  const result = blocks.reduce((acc, block) => {
    const [selectors, rules] = cleanSplit(block, '{')
    const cleanRules = cleanSplit(rules, ';')
    cleanSplit(selectors, ',').forEach(selector => {
      cleanRules.forEach(rule => {
        if(acc[rule]) {
          acc[rule].count += 1
          acc[rule].selectors.push(selector)
        } else {
          acc[rule] = {
            count: 1,
            selectors: [selector]
          }
        }
      })
    })
    return acc
  }, {})
  return sortByCount(result)
}

const countMediaRules = (css) => {
  const mediaBlocks = css.match(reg.mediaBlocks)
  return mediaBlocks.reduce((acc, mBlock) => {
    const mediaRuleWithBrace = mBlock.match(reg.mediaRule)[0]
    const ruleBlocks = mBlock.replace(mediaRuleWithBrace, '')
      .replace(reg.consecutiveBraces, '}').trim()
    const mediaRule = cleanReplace(mediaRuleWithBrace, '{', '')
    const ruleCounts = countRules(ruleBlocks)
    if (acc[mediaRule]) {
      acc[mediaRule] = Object.assign(ruleCounts, acc[mediaRule])
    } else {
      acc[mediaRule] = ruleCounts
    }
    return acc
  }, {})
}

const writeData = json => {
  fs.writeFile(WRITE_PATH, json, ENCODING, (err) => {
    if (err) throw err
    console.log(`Written to ${WRITE_PATH}`)
  })
}

const parseCss = url => {
  console.log(`Getting css from ${url}`)
  getCss(url)
    .then((resp) => {
      const css = resp.css
      console.log('Parsing')
      const cleanCss = cleanReplace(cleanReplace(css, reg.comments, ''), reg.fontface, '')
      const cleanNoMediaCss = cleanReplace(cleanCss, reg.mediaBlocks, '')
      const rulesCount = [].concat(
        countRules(cleanNoMediaCss),
        countMediaRules(cleanCss)
      )
      writeData(JSON.stringify(rulesCount))
    })
    .catch(err => {
      throw err
    })
}

commander
  .arguments('<url>')
  .action(parseCss)
  .parse(process.argv)

