// Happy Birthday melody (simplified notes)
export const happyBirthdayNotes = [
  { note: 'C', frequency: 261.63, duration: 500 },
  { note: 'C', frequency: 261.63, duration: 250 },
  { note: 'D', frequency: 293.66, duration: 750 },
  { note: 'C', frequency: 261.63, duration: 750 },
  { note: 'F', frequency: 349.23, duration: 750 },
  { note: 'E', frequency: 329.63, duration: 1500 },
  { note: 'C', frequency: 261.63, duration: 500 },
  { note: 'C', frequency: 261.63, duration: 250 },
  { note: 'D', frequency: 293.66, duration: 750 },
  { note: 'C', frequency: 261.63, duration: 750 },
  { note: 'G', frequency: 392.00, duration: 750 },
  { note: 'F', frequency: 349.23, duration: 1500 }
];

// Romantic poems collection
export const poems = [
  "In your eyes, I see the stars,\nIn your smile, my world ignites.\nEvery moment spent with you,\nMakes everything feel right. ✨",
  
  "You are my sunshine on cloudy days,\nMy rainbow after every storm.\nWith you, life becomes a beautiful song,\nAnd love takes its perfect form. 🌈",
  
  "Like flowers bloom in spring,\nMy love for you grows each day.\nYou're the melody in my heart,\nThe words I long to say. 🌸",
  
  "Your laughter is my favorite sound,\nYour happiness, my greatest treasure.\nIn this dance of life we share,\nYou're my rhythm and my measure. 💃",
  
  "When I count my blessings,\nI count you twice, maybe thrice.\nYou've made my world so beautiful,\nMy heart's own paradise. 💖",
  
  "You're the coffee to my morning,\nThe stars to my night sky.\nWith you, every ordinary moment\nBecomes a reason to fly high. ☕✨",
  
  "Time stands still when you're near,\nThe world fades away but you.\nIn your arms I find my home,\nIn your heart, my dreams come true. 🏠💕",
  
  "You paint colors in my gray days,\nBring music to my silent nights.\nWith every kiss, every touch,\nYou make everything feel right. 🎨🎵",
  
  "Distance means nothing when love means everything,\nMiles apart but hearts as one.\nEvery sunset brings me closer\nTo the day our love has won. 🌅❤️",
  
  "In a world of temporary things,\nYou are my constant, my forever.\nThrough seasons change and years go by,\nMy love for you will fade never. 🌿♾️",
  
  "You're the answer to my prayers,\nThe wish upon my shooting star.\nNo matter where life takes us,\nYou'll always be my guiding star. ⭐🙏",
  
  "Every heartbeat whispers your name,\nEvery breath carries your love.\nYou're my earth, my moon, my sun,\nMy blessing sent from above. 🌍🌙☀️",
  
  "In your smile I find my courage,\nIn your voice I hear my song.\nWith you beside me always,\nI know where I belong. 😊🎶",
  
  "Love letters written in the stars,\nPromises made with morning dew.\nEvery day I fall deeper,\nMore madly in love with you. 💌⭐",
  
  "You're my favorite notification,\nMy sweetest dream come true.\nIn this crazy, busy world,\nMy peace is found in you. 📱💤"
];

// Special custom poem
export const specialPoem = 
  "In depths of heart, a love resides,\nA flame that burns, a love that guides.\nA love so pure, so strong, so true,\nA love for you, forever new.\n\nWith every beat, my heart does yearn,\nFor your sweet love, a wish to learn.\nA love that grows, with every day,\nA love that shines, come what may.\n\nYour eyes, a star, a guiding light,\nYour smile, a sun, so warm and bright.\nYour touch, a solace, soft and deep,\nYour love, a treasure, I'll forever keep.\n\nSo let us vow, to love and care,\nTo face life's storms, together we'll share.\nA bond unbroken, a love divine,\nForever yours, and ever mine. 💖";

// Target date for unlock
export const targetDate = new Date('2025-01-01T00:00:00');

// Game configuration
export const GAME_CONFIG = {
  INITIAL_LIVES: 3,
  MAX_LIVES: 5,
  BASE_TILE_SPEED: 4,
  BASE_SPAWN_INTERVAL: 1500,
  MIN_SPAWN_INTERVAL: 800,
  POWER_UP_SPAWN_CHANCE: 0.15,
  COMBO_BONUS_INTERVAL: 5,
  MAX_SIMULTANEOUS_NOTES: 6,
  GAME_LOOP_INTERVAL: 50, // 20 FPS
  DANGER_ZONE_HEIGHT: 450
};
