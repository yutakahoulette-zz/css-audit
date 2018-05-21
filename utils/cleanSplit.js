const cleanSplit = (st, delimiter) => 
  st.split(delimiter)
    .map(x => x.trim())
    .filter(Boolean)

module.exports = cleanSplit

