const ADJECTIVES = [
  'Brave', 'Swift', 'Clever', 'Happy', 'Bright', 'Calm', 'Daring', 'Eager',
  'Fierce', 'Gentle', 'Jolly', 'Kind', 'Lucky', 'Mighty', 'Noble', 'Proud',
  'Quick', 'Radiant', 'Sharp', 'Tiny', 'Bold', 'Cozy', 'Dazzling', 'Fluffy',
  'Glowing', 'Humble', 'Icy', 'Jumpy', 'Lively', 'Misty', 'Nimble', 'Peppy',
  'Quirky', 'Rosy', 'Snappy', 'Sunny', 'Bouncy', 'Cheery', 'Fancy', 'Golden',
  'Cosmic', 'Dashing', 'Funky', 'Nifty', 'Plucky', 'Zippy', 'Silvery', 'Dandy',
  'Groovy', 'Handy',
]

const ANIMALS = [
  // Farm & Domestic
  'Cat', 'Dog', 'Cow', 'Pig', 'Sheep', 'Horse', 'Goat', 'Chicken', 'Duck',
  'Rabbit', 'Donkey', 'Turkey', 'Hamster', 'Parrot', 'Goldfish',
  // Safari & African
  'Lion', 'Tiger', 'Elephant', 'Giraffe', 'Zebra', 'Hippo', 'Rhino', 'Gorilla',
  'Cheetah', 'Leopard', 'Baboon', 'Meerkat', 'Flamingo', 'Ostrich', 'Crocodile',
  // Ocean & Water
  'Dolphin', 'Whale', 'Shark', 'Octopus', 'Crab', 'Lobster', 'Seal', 'Walrus',
  'Penguin', 'Jellyfish', 'Seahorse', 'Otter', 'Beaver', 'Frog',
  // Birds
  'Eagle', 'Owl', 'Peacock', 'Toucan', 'Pelican', 'Robin', 'Swan', 'Hawk',
  'Puffin', 'Crow', 'Stork', 'Macaw',
  // Forest & Woodland
  'Bear', 'Wolf', 'Fox', 'Deer', 'Moose', 'Raccoon', 'Squirrel', 'Hedgehog',
  'Badger', 'Skunk', 'Porcupine', 'Chipmunk', 'Bison', 'Elk', 'Lynx',
  // Jungle & Tropical
  'Monkey', 'Jaguar', 'Sloth', 'Iguana', 'Chameleon', 'Gecko', 'Lemur',
  'Tapir', 'Panther',
  // Desert & Grassland
  'Camel', 'Kangaroo', 'Koala', 'Dingo', 'Armadillo', 'Coyote',
  // Bugs
  'Butterfly', 'Ladybug', 'Firefly', 'Bumblebee', 'Dragonfly',
  // Fan favourites
  'Mammoth', 'Narwhal', 'Platypus', 'Manatee', 'Axolotl', 'Capybara',
  'Quokka', 'Panda', 'Wombat',
]

// ADJECTIVES.length = 50, ANIMALS.length = 100 → 5,000 unique combinations

function hash(sub: string): number {
  let h = 0
  for (let i = 0; i < sub.length; i++) {
    h = (Math.imul(31, h) + sub.charCodeAt(i)) | 0
  }
  return Math.abs(h)
}

export function generateDisplayName(googleSub: string): string {
  const h = hash(googleSub)
  const adj = ADJECTIVES[h % ADJECTIVES.length]
  const animal = ANIMALS[Math.floor(h / ADJECTIVES.length) % ANIMALS.length]
  return `${adj} ${animal}`
}

export function generateRandomDisplayName(): string {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)]
  const animal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)]
  return `${adj} ${animal}`
}

