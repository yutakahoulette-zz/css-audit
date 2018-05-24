const data = require('./data.json')

const getByIds = ids => ids.map(id => document.getElementById(id))
const set = (elm, data='') => {
  elm.innerHTML = data
}

const [titleElm, mediaElm, noMediaElm] = 
  getByIds(['title', 'media', 'noMedia'])

set(titleElm, data.title)

const formatRule = rule => {
  const [prop, val] = rule.split(':').map(x => x.trim())
  return `${prop} : <span class='grey'>${val}</span>`
}

const statsBox = data => {
  return data.map(d => `
    <div class='statsBox'>
      <h3><span class='count'>${d.count}</span> ${formatRule(d.rule)}</h3>
      <a class='toggleSelectors'>Show selectors</a>
      <div class='hide selectors'>
        ${d.selectors.map(s => `<span class='pill'>${s}</span>`).join('')}
      </div>
    </div>
  `).join('')
}

set(noMediaElm, statsBox(data.noMedia))

document.querySelectorAll('.toggleSelectors').forEach(ts => {
  ts.addEventListener('click', (ev) => {
    const selectors = ts.parentElement.querySelector('.selectors')
    const setText = (bool) => {
      ts.innerHTML = `${bool ? 'Hide' : 'Show'} selectors`
    }
    setText(selectors.classList.contains('hide'))
    selectors.classList.toggle('hide')
  })
})

