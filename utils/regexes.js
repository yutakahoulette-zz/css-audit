// entire media query block
const mediaBlocks = /@media[^{]+\{([\s\S]+?})\s*}/g

// from '@media' to first '{'
const mediaRule = /@media[^{]+{/



// handles single and multi-line
const comments = /\/\*[^*]*\*+([^\/\*][^*]*\*+)*\//gmi

const consecutiveBraces = /}[\n\s]+}|}}}[\n\s]+}|}}/g

const fontface = /@font-face[\s]*\{([\s\S]+?)\s*}/g

module.exports = {
  mediaBlocks,
  mediaRule,
  comments,
  consecutiveBraces,
  fontface
}
