const getCss = require('get-css')
const reg = require('./utils/regexes')
const cleanSplit = require('./utils/cleanSplit')
const cleanReplace = require('./utils/cleanReplace')

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

const stats = data => {
  return data.map(d => `
    <div class='box'>
      <h2>${d.rule}</h2>
      <h3>${d.count}</h3>
      <div>
        ${d.selectors.map(s => `<span class='pill'>${s}</span>`).join('')}
      </div>
    </div>
  `).join('')
}

const renderData = obj => {
  const noMediaView = stats(obj.noMedia)
  resultsElm.innerHTML = noMediaView
}

const parseCss = url => {
  getCss(url)
    .then((resp) => {
      const css = resp.css
      const cleanCss = cleanReplace(cleanReplace(css, reg.comments, ''), reg.fontface, '')
      const cleanNoMediaCss = cleanReplace(cleanCss, reg.mediaBlocks, '')
      const rulesCount = {
        noMedia: countRules(cleanNoMediaCss),
        media: countMediaRules(cleanCss)
      }
      renderData(rulesCount)
    })
    .catch(err => {
      throw err
    })
}

const submit = ev => {
  ev.preventDefault()
  const url = ev.target.querySelector('input').value
  parseCss(url)
}

const formElm = document.getElementById('form')
const resultsElm = document.getElementById('results')

formElm.addEventListener('submit', submit)

