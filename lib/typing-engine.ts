export function calculateWpm(chars: number, seconds: number): number {
  if (seconds === 0) return 0
  return Math.round((chars / 5) / (seconds / 60))
}

export function calculateAccuracy(correct: number, total: number): number {
  if (total === 0) return 1
  return Math.min(1, Math.max(0, correct / total))
}

export function analyzeWeakKeys(
  targetText: string,
  typedText: string
): Record<string, number> {
  const keyErrors: Record<string, number> = {}
  const keyTotal: Record<string, number> = {}

  const len = Math.min(targetText.length, typedText.length)
  for (let i = 0; i < len; i++) {
    const target = targetText[i].toLowerCase()
    if (target === ' ' || target === '\n') continue

    if (!keyTotal[target]) keyTotal[target] = 0
    if (!keyErrors[target]) keyErrors[target] = 0

    keyTotal[target]++
    if (typedText[i] !== targetText[i]) {
      keyErrors[target]++
    }
  }

  const result: Record<string, number> = {}
  for (const key of Object.keys(keyTotal)) {
    if (keyTotal[key] > 0) {
      result[key] = keyErrors[key] / keyTotal[key]
    }
  }

  return result
}

const WORD_BANK: Record<string, string[]> = {
  a: ['and', 'at', 'an', 'as', 'all', 'also', 'after', 'ask', 'again', 'above', 'about', 'act', 'add', 'age', 'ago', 'aid', 'aim', 'air', 'area', 'arm'],
  b: ['be', 'but', 'by', 'back', 'been', 'before', 'both', 'big', 'bad', 'bar', 'base', 'bay', 'bed', 'best', 'bird', 'bit', 'blue', 'boat', 'book', 'box'],
  c: ['can', 'come', 'could', 'call', 'came', 'case', 'city', 'close', 'cold', 'color', 'cost', 'car', 'cat', 'coal', 'core', 'cut', 'cup', 'care', 'cave', 'coat'],
  d: ['do', 'did', 'does', 'down', 'day', 'date', 'deep', 'door', 'draw', 'drop', 'dark', 'deal', 'dear', 'desk', 'diet', 'disc', 'disk', 'dive', 'dock', 'dog'],
  e: ['each', 'end', 'even', 'ever', 'every', 'ear', 'eat', 'edge', 'else', 'emit', 'eye', 'earn', 'easy', 'echo', 'edit', 'else', 'exam', 'exit', 'expo', 'extra'],
  f: ['for', 'from', 'find', 'first', 'few', 'far', 'fast', 'feel', 'fell', 'felt', 'fill', 'film', 'fire', 'fish', 'five', 'flat', 'flew', 'flow', 'fly', 'fold'],
  g: ['get', 'give', 'go', 'good', 'great', 'got', 'grow', 'game', 'gate', 'gave', 'gear', 'gift', 'girl', 'glad', 'glow', 'glue', 'goal', 'gold', 'gone', 'grab'],
  h: ['have', 'he', 'her', 'here', 'him', 'his', 'how', 'had', 'hand', 'hard', 'head', 'help', 'high', 'hill', 'hold', 'home', 'hope', 'hour', 'huge', 'hunt'],
  i: ['in', 'is', 'it', 'its', 'into', 'idea', 'if', 'ill', 'inch', 'iron', 'item', 'icon', 'isle', 'itch', 'ibis', 'idle', 'info', 'inky', 'inks', 'ions'],
  j: ['just', 'job', 'joy', 'jet', 'jar', 'jaw', 'jam', 'jab', 'jog', 'join', 'joke', 'jump', 'jury', 'just', 'jive', 'jade', 'jail', 'jazz', 'jean', 'jeer'],
  k: ['keep', 'key', 'kind', 'knew', 'know', 'keen', 'kick', 'kill', 'king', 'kiss', 'knit', 'knob', 'knot', 'kale', 'kelp', 'kern', 'knack', 'kneel', 'kite', 'kiln'],
  l: ['like', 'long', 'look', 'let', 'life', 'last', 'late', 'law', 'lead', 'lean', 'left', 'less', 'lift', 'line', 'link', 'list', 'live', 'load', 'loan', 'lock'],
  m: ['make', 'may', 'more', 'much', 'my', 'made', 'man', 'many', 'map', 'mark', 'mass', 'mean', 'meet', 'mile', 'mind', 'miss', 'mode', 'moon', 'most', 'move'],
  n: ['not', 'now', 'new', 'no', 'name', 'near', 'need', 'next', 'nice', 'nine', 'node', 'none', 'noon', 'norm', 'nose', 'note', 'noun', 'null', 'nuts', 'nail'],
  o: ['or', 'out', 'one', 'only', 'of', 'on', 'our', 'old', 'off', 'odd', 'oil', 'open', 'oral', 'oven', 'over', 'own', 'oath', 'obey', 'once', 'onto'],
  p: ['put', 'people', 'place', 'plan', 'play', 'part', 'past', 'path', 'pick', 'plan', 'plus', 'pole', 'pool', 'poor', 'post', 'pour', 'pull', 'pure', 'push', 'pace'],
  q: ['quite', 'quick', 'quit', 'quiz', 'quad', 'quid', 'quip', 'queue', 'quay', 'quest', 'query', 'quote', 'quilt', 'quirk', 'quota', 'quaff', 'qualm', 'quash', 'quail', 'quake'],
  r: ['run', 'right', 'read', 'real', 'rest', 'race', 'rain', 'rank', 'rate', 'rich', 'ride', 'ring', 'rise', 'risk', 'road', 'rock', 'role', 'roll', 'roof', 'room'],
  s: ['some', 'so', 'see', 'said', 'she', 'say', 'set', 'side', 'sign', 'site', 'size', 'skip', 'slow', 'snap', 'snow', 'soft', 'soil', 'sold', 'sole', 'song'],
  t: ['the', 'that', 'this', 'to', 'time', 'than', 'take', 'tell', 'test', 'text', 'then', 'they', 'thus', 'tide', 'tied', 'tile', 'till', 'tiny', 'told', 'tone'],
  u: ['up', 'use', 'upon', 'used', 'unit', 'undo', 'user', 'ugly', 'urge', 'used', 'uniform', 'union', 'unique', 'unit', 'until', 'unto', 'upper', 'urban', 'ultra', 'utter'],
  v: ['very', 'view', 'vast', 'vane', 'vary', 'veil', 'verb', 'vest', 'vice', 'vine', 'void', 'volt', 'vote', 'vale', 'vain', 'vamp', 'vane', 'veer', 'vent', 'vex'],
  w: ['with', 'was', 'we', 'will', 'way', 'want', 'warm', 'warn', 'wave', 'weak', 'wear', 'well', 'went', 'were', 'wide', 'wild', 'wind', 'wine', 'wing', 'wire'],
  x: ['extra', 'exact', 'exam', 'exit', 'exist', 'excel', 'expert', 'expel', 'expect', 'extend', 'extern', 'extra', 'extreme', 'exert', 'exile', 'index', 'annex', 'mixed', 'fixed', 'boxed'],
  y: ['you', 'your', 'yet', 'year', 'yes', 'yarn', 'yard', 'yawn', 'yell', 'yoke', 'your', 'yore', 'young', 'yours', 'youth', 'yield', 'yearly', 'yeast', 'yokel', 'yule'],
  z: ['zero', 'zone', 'zoom', 'zeal', 'zinc', 'zap', 'zip', 'zen', 'zest', 'zing', 'zone', 'zoo', 'zoned', 'zones', 'zoom', 'zooms', 'zappy', 'zippy', 'zincy', 'zesty'],
}

export function generateDynamicText(
  weakKeys: string[],
  targetLength: number
): string {
  const topWeakKeys = weakKeys.slice(0, 3)
  const words: string[] = []
  const allKeys = Object.keys(WORD_BANK)

  const targetWords = Math.ceil(targetLength / 5)
  const weakWordCount = Math.floor(targetWords * 0.6)
  const randomWordCount = targetWords - weakWordCount

  for (let i = 0; i < weakWordCount; i++) {
    const key = topWeakKeys[i % topWeakKeys.length] || allKeys[0]
    const bank = WORD_BANK[key] || WORD_BANK['a']
    words.push(bank[Math.floor(Math.random() * bank.length)])
  }

  for (let i = 0; i < randomWordCount; i++) {
    const key = allKeys[Math.floor(Math.random() * allKeys.length)]
    const bank = WORD_BANK[key]
    words.push(bank[Math.floor(Math.random() * bank.length)])
  }

  for (let i = words.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[words[i], words[j]] = [words[j], words[i]]
  }

  let text = words.join(' ')
  while (text.length < targetLength) {
    const key = topWeakKeys[0] || allKeys[0]
    const bank = WORD_BANK[key] || WORD_BANK['a']
    text += ' ' + bank[Math.floor(Math.random() * bank.length)]
  }

  return text.slice(0, targetLength).trim()
}
