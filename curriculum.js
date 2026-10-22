/* Workshop Reader - curriculum
 *
 * Levels follow a systematic phonics sequence (letter sounds -> CVC ->
 * digraphs -> blends -> magic e -> vowel teams -> r-controlled ->
 * multisyllable -> technical vocabulary). Every word list and mission is
 * built only from patterns taught so far, plus:
 *   tricky  - high-frequency "heart words" that don't follow the rules yet
 *   preview - content words above the current level; these are marked in
 *             missions and can be heard for free
 *
 * To add words: append { w: 'word', e: 'emoji' } to a level. The emoji is
 * optional; words with one show up in "Read & Pick".
 * To add a level: copy one and change id/name. Levels unlock in order.
 */

window.CURRICULUM = {

  levels: [

    // ---------- PART 1: LETTER SOUNDS ----------
    {
      id: 1, kind: 'sounds', name: 'Vowel Sounds', cert: 'Vowel Tech',
      project: 'egg', part: { name: 'Frame', e: '🪵', note: 'The base of the egg harvester.' },
      pattern: 'The five vowels are a, e, i, o, u. Every word needs a vowel. Today we learn the short sound of each one.',
      sounds: [
        { g: 'a', key: 'ax',   e: '🪓' },
        { g: 'e', key: 'egg',  e: '🥚' },
        { g: 'i', key: 'inch', e: '📏' },
        { g: 'o', key: 'on',   e: '🔛' },
        { g: 'u', key: 'up',   e: '⬆️' }
      ]
    },
    {
      id: 2, kind: 'sounds', name: 'Consonants I', cert: 'Parts Sorter',
      project: 'egg', part: { name: 'Ramp', e: '🛝', note: 'Eggs roll down the ramp, gently.' },
      pattern: 'Consonants are all the letters that are not vowels. Each one makes a sound. Listen to the first sound of each part.',
      sounds: [
        { g: 'm', key: 'magnet',  e: '🧲' },
        { g: 's', key: 'saw',     e: '🪚' },
        { g: 't', key: 'tractor', e: '🚜' },
        { g: 'p', key: 'plug',    e: '🔌' },
        { g: 'n', key: 'nut',     e: '🔩' },
        { g: 'c', key: 'car',     e: '🚗', alt: ['k'] },
        { g: 'd', key: 'dig',     e: '⛏️' },
        { g: 'g', key: 'gear',    e: '⚙️' }
      ]
    },
    {
      id: 3, kind: 'sounds', name: 'Consonants II', cert: 'Tool Crib',
      project: 'egg', part: { name: 'Pulley', e: '🎡', note: 'A pulley and string lift the egg tray.' },
      pattern: 'More consonant sounds. Say each part out loud and feel your mouth make the first sound.',
      sounds: [
        { g: 'b', key: 'battery', e: '🔋' },
        { g: 'h', key: 'hammer',  e: '🔨' },
        { g: 'f', key: 'fire',    e: '🔥' },
        { g: 'l', key: 'lamp',    e: '💡' },
        { g: 'r', key: 'robot',   e: '🤖' },
        { g: 'w', key: 'wheel',   e: '🛞' },
        { g: 'j', key: 'jet',     e: '✈️' },
        { g: 'k', key: 'key',     e: '🔑', alt: ['c'] }
      ]
    },
    {
      id: 4, kind: 'sounds', name: 'Consonants III', cert: 'Sound Engineer',
      project: 'egg', part: { name: 'Lever', e: '🎚️', note: 'A lever tips the eggs into the bin.' },
      pattern: 'The last few letters. Watch out: x makes its sound at the END of a word, like box. And q almost always comes with u.',
      sounds: [
        { g: 'v',  key: 'van',   e: '🚐' },
        { g: 'y',  key: 'yo-yo', e: '🪀' },
        { g: 'z',  key: 'zap',   e: '⚡' },
        { g: 'x',  key: 'box',   e: '📦', pos: 'end' },
        { g: 'qu', key: 'quack', e: '🦆', alt: ['q'] }
      ]
    },

    // ---------- PART 2: SHORT-VOWEL WORDS ----------
    {
      id: 5, kind: 'words', name: 'Short a and i', cert: 'Apprentice Reader I',
      project: 'egg', part: { name: 'Egg Bin', e: '🧺', note: 'A big bin catches the eggs.' },
      pattern: 'Now we blend sounds into words! Say each sound, then slide them together: c - a - n ... can. Words with one vowel in the middle use the short sound.',
      tricky: ['a', 'the', 'is', 'has', 'I', 'and', 'on', 'yes', 'no', 'what', 'does'],
      words: [
        { w: 'can', e: '🥫' }, { w: 'cap', e: '🧢' }, { w: 'gas', e: '⛽' }, { w: 'map', e: '🗺️' },
        { w: 'ram', e: '🐏' }, { w: 'van', e: '🚐' }, { w: 'hat', e: '🎩' }, { w: 'cab' },
        { w: 'cam' }, { w: 'jam' }, { w: 'pad' }, { w: 'tab' }, { w: 'bag' },
        { w: 'pin', e: '📌' }, { w: 'bin', e: '🗑️' }, { w: 'dig', e: '⛏️' }, { w: 'pig', e: '🐖' },
        { w: 'kit' }, { w: 'rim' }, { w: 'tin' }, { w: 'zip' }, { w: 'lid' }, { w: 'fix' },
        { w: 'big' }, { w: 'fit' }, { w: 'bit' }, { w: 'tap' }
      ],
      missions: [{
        title: 'The Big Bin',
        preview: [],
        text: [
          'Jim has a bin.',
          'The bin is big.',
          'Jim has a lid and a pin.',
          'Jim can fit the lid on the bin.',
          'Tap, tap, tap! Jim can fix it.',
          'The bin is a hit!'
        ],
        q: [
          { q: 'What does Jim have?', choices: ['a bin', 'a van', 'a cap'], a: 0 },
          { q: 'Is the bin big?', choices: ['yes', 'no'], a: 0 },
          { q: 'What can Jim fit on the bin?', choices: ['a hat', 'the lid', 'a pig'], a: 1 }
        ]
      }]
    },
    {
      id: 6, kind: 'words', name: 'Short o, u, and e', cert: 'Apprentice Reader II',
      project: 'egg', part: { name: 'Conveyor', e: '🛤️', note: 'A belt moves eggs from the hens to the bin. Egg harvester done!' },
      pattern: 'Three more short vowels: o as in on, u as in up, e as in egg. Same trick: say each sound, then blend.',
      tricky: ['to', 'of', 'and', 'put', 'said'],
      words: [
        { w: 'box', e: '📦' }, { w: 'hot', e: '🔥' }, { w: 'log', e: '🪵' }, { w: 'fox', e: '🦊' },
        { w: 'ox', e: '🐂' }, { w: 'cog' }, { w: 'rod' }, { w: 'top' }, { w: 'dot' }, { w: 'job' },
        { w: 'nut', e: '🔩' }, { w: 'bug', e: '🐛' }, { w: 'tub', e: '🛁' }, { w: 'sun', e: '☀️' },
        { w: 'cup', e: '☕' }, { w: 'bus', e: '🚌' }, { w: 'hub' }, { w: 'cut' }, { w: 'run' }, { w: 'mud' },
        { w: 'hen', e: '🐔' }, { w: 'egg', e: '🥚' }, { w: 'net', e: '🥅' }, { w: 'bed', e: '🛏️' },
        { w: 'ten', e: '🔟' }, { w: 'web', e: '🕸️' }, { w: 'leg', e: '🦵' },
        { w: 'peg' }, { w: 'set' }, { w: 'wet' }, { w: 'jet' }, { w: 'red' }
      ],
      missions: [{
        title: 'Ten Hens',
        preview: [],
        text: [
          'Ten hens sit in a pen.',
          'A red hen has an egg.',
          'The egg can not sit in the mud!',
          'Gus has a big box and a tub.',
          'Gus can put the egg in the tub.',
          'The tub can run on a rod. Hum, hum, hum!',
          'The egg is in the box. Gus did it!'
        ],
        q: [
          { q: 'How many hens are in the pen?', choices: ['six', 'ten', 'a lot'], a: 1 },
          { q: 'What does the tub run on?', choices: ['a rod', 'a bus', 'a log'], a: 0 },
          { q: 'Where is the egg at the end?', choices: ['in the mud', 'on the bed', 'in the box'], a: 2 }
        ]
      }]
    },

    // ---------- PART 3: DIGRAPHS, BLENDS, MAGIC E (RC car) ----------
    {
      id: 7, kind: 'words', name: 'Digraphs: sh ch th ck ng tch', cert: 'Wiring Tech I',
      project: 'rc', part: { name: 'Wire Check', e: '🔎', note: 'Find the broken wire in the RC car.' },
      pattern: 'Two letters, ONE sound. s+h = sh (ship). c+h = ch (chip). t+h = th (thin). c+k = ck at the end (lock). n+g = ng (ring). t+c+h = tch (switch). Also: short words often double the last l, s, f, or z (bell, mess, off, buzz).',
      tricky: ['was', 'you', 'he', 'she', 'are', 'do'],
      words: [
        { w: 'ship', e: '🚢' }, { w: 'fish', e: '🐟' }, { w: 'cash', e: '💵' }, { w: 'shed' }, { w: 'shop' }, { w: 'shut' },
        { w: 'chess', e: '♟️' }, { w: 'chip' }, { w: 'chop' }, { w: 'much' }, { w: 'rich' },
        { w: 'bath', e: '🛁' }, { w: 'thin' }, { w: 'thick' }, { w: 'path' }, { w: 'math' }, { w: 'with' },
        { w: 'lock', e: '🔒' }, { w: 'sock', e: '🧦' }, { w: 'duck', e: '🦆' }, { w: 'jack' }, { w: 'rack' }, { w: 'pick' }, { w: 'check' },
        { w: 'ring', e: '💍' }, { w: 'king', e: '👑' }, { w: 'bang', e: '💥' }, { w: 'long' }, { w: 'hang' },
        { w: 'switch' }, { w: 'patch' }, { w: 'latch' }, { w: 'notch' }, { w: 'match' },
        { w: 'bell', e: '🔔' }, { w: 'buzz', e: '🐝' }, { w: 'off' }, { w: 'mess' }, { w: 'will' }, { w: 'fill' }
      ],
      missions: [{
        title: 'The RC Car Will Not Run',
        preview: ['RC', 'from', 'wire', 'solder', 'then'],
        text: [
          'Mack has an RC car. It is red and black.',
          'Mack hit the switch. The car did not run.',
          'Mack got his kit from the shed.',
          'He did a check. A wire was cut!',
          'Mack can fix it. He will patch it with solder.',
          'Then the car can zip and buzz!'
        ],
        q: [
          { q: 'What color is the car?', choices: ['red and black', 'tan and black', 'red and tan'], a: 0 },
          { q: 'What was cut?', choices: ['a chip', 'a wire', 'a ring'], a: 1 },
          { q: 'Where did Mack get his kit?', choices: ['the ship', 'the bath', 'the shed'], a: 2 }
        ]
      }]
    },
    {
      id: 8, kind: 'words', name: 'Blends', cert: 'Wiring Tech II',
      project: 'rc', part: { name: 'Solder Joint', e: '🔥', note: 'Strip, twist, solder, tape. The wire is fixed.' },
      pattern: 'A blend is two or three consonants side by side. You still hear EACH sound: s-t-r-i-p ... strip. Also nk, like tank and blink.',
      tricky: ['what', 'want', 'have', 'one', 'two'],
      words: [
        { w: 'plug', e: '🔌' }, { w: 'frog', e: '🐸' }, { w: 'drum', e: '🥁' }, { w: 'flag', e: '🚩' },
        { w: 'clock', e: '⏰' }, { w: 'truck', e: '🚚' }, { w: 'crab', e: '🦀' }, { w: 'sled', e: '🛷' },
        { w: 'plant', e: '🌱' }, { w: 'brick', e: '🧱' }, { w: 'clip', e: '📎' }, { w: 'link', e: '🔗' },
        { w: 'tent', e: '⛺' }, { w: 'hand', e: '✋' },
        { w: 'drill' }, { w: 'crank' }, { w: 'clamp' }, { w: 'belt' }, { w: 'grip' }, { w: 'spin' },
        { w: 'slot' }, { w: 'snap' }, { w: 'flat' }, { w: 'strip' }, { w: 'twist' }, { w: 'tank' },
        { w: 'lift' }, { w: 'stand' }, { w: 'melt' }, { w: 'blink' }, { w: 'drift' }, { w: 'snip' }
      ],
      missions: [{
        title: 'Strip, Twist, and Melt',
        preview: ['wire', 'solder', 'iron', 'careful', 'tape', 'LEDs'],
        text: [
          'Mack must fix the cut wire.',
          'He grabs the strippers. Snip, strip!',
          'He twists the two ends. Twist, twist, twist.',
          'Next, he must melt the solder on the twist.',
          'The tip of the iron is hot! Mack is careful.',
          'He wraps it in black tape.',
          'Mack flips the switch. The LEDs blink! The car can spin and drift!'
        ],
        q: [
          { q: 'What does Mack twist?', choices: ['the plug', 'the two ends', 'the drum'], a: 1 },
          { q: 'What part is hot?', choices: ['the tip of the iron', 'the tape', 'the car'], a: 0 },
          { q: 'What do the LEDs do?', choices: ['melt', 'snap', 'blink'], a: 2 }
        ]
      }]
    },
    {
      id: 9, kind: 'words', name: 'Magic e', cert: 'Lighting Tech',
      project: 'rc', part: { name: 'LED Headlights', e: '💡', note: 'The RC car can drive in the dark. RC car done!' },
      pattern: 'An e at the end is silent, but it is magic: it makes the vowel say its NAME. pin becomes pine. tub becomes tube. cap becomes cape.',
      tricky: ['some', 'come', 'were', 'there', 'they', 'where'],
      words: [
        { w: 'crane', e: '🏗️' }, { w: 'plate', e: '🍽️' }, { w: 'cube', e: '🧊' }, { w: 'bike', e: '🚲' },
        { w: 'kite', e: '🪁' }, { w: 'game', e: '🎮' }, { w: 'cake', e: '🎂' }, { w: 'rose', e: '🌹' },
        { w: 'bone', e: '🦴' }, { w: 'globe', e: '🌍' }, { w: 'nose', e: '👃' }, { w: 'slide', e: '🛝' },
        { w: 'wire' }, { w: 'pipe' }, { w: 'tube' }, { w: 'gate' }, { w: 'hose' }, { w: 'cone' },
        { w: 'drive' }, { w: 'code' }, { w: 'line' }, { w: 'file' }, { w: 'tape' }, { w: 'hole' },
        { w: 'rope' }, { w: 'shine' }, { w: 'five' }, { w: 'side' }, { w: 'time' }, { w: 'smile' }, { w: 'white' }
      ],
      missions: [{
        title: 'Make the LEDs Shine',
        preview: ['LEDs', 'LED', 'short', 'minus', 'dark', 'each'],
        text: [
          'Mack has five white LEDs. He will make the car shine in the dark.',
          'He runs a thin wire from the nose to the back.',
          'Each LED has two legs. One leg is long. One leg is short.',
          'The long leg is plus. The short leg is minus.',
          'If the legs are on the wrong side, the LED will not shine!',
          'Mack lines them up and checks them.',
          'He hits the switch. The LEDs shine! Mack smiles. "Time to drive!"'
        ],
        q: [
          { q: 'How many LEDs does Mack have?', choices: ['one', 'five', 'nine'], a: 1 },
          { q: 'Which leg is plus?', choices: ['the long leg', 'the short leg'], a: 0 },
          { q: 'What did Mack do at the end?', choices: ['smile', 'hide', 'ride a bike'], a: 0 }
        ]
      }]
    },

    // ---------- PART 4: VOWEL TEAMS, R-CONTROLLED, BIG WORDS (FTC robot) ----------
    {
      id: 10, kind: 'words', name: 'Vowel Teams', cert: 'Drivetrain Builder',
      project: 'ftc', part: { name: 'Drivetrain', e: '🛞', note: 'Four omni wheels, motors, and gears.' },
      pattern: 'When two vowels go walking, the first one often does the talking: ee (wheel), ea (beam), ai (chain), oa (boat). Other teams make new sounds: oo (tool), oi (coil), oy (toy), aw (saw), ow (power), ou (mount).',
      tricky: ['could', 'would', 'should', 'does', 'goes', 'our'],
      words: [
        { w: 'train', e: '🚆' }, { w: 'tree', e: '🌳' }, { w: 'sheep', e: '🐑' }, { w: 'boat', e: '⛵' },
        { w: 'goat', e: '🐐' }, { w: 'soap', e: '🧼' }, { w: 'moon', e: '🌙' }, { w: 'boot', e: '👢' },
        { w: 'spoon', e: '🥄' }, { w: 'broom', e: '🧹' }, { w: 'hook', e: '🪝' }, { w: 'book', e: '📖' },
        { w: 'paint', e: '🎨' }, { w: 'snail', e: '🐌' }, { w: 'chain', e: '⛓️' }, { w: 'toy', e: '🧸' },
        { w: 'saw', e: '🪚' }, { w: 'oil', e: '🛢️' }, { w: 'tool', e: '🔧' },
        { w: 'wheel' }, { w: 'steel' }, { w: 'gear' }, { w: 'beam' }, { w: 'load' }, { w: 'rail' },
        { w: 'feed' }, { w: 'coil' }, { w: 'spool' }, { w: 'screw' }, { w: 'seal' }, { w: 'cool' },
        { w: 'zoom' }, { w: 'power' }, { w: 'mount' }, { w: 'down' }, { w: 'point' }, { w: 'team' }
      ],
      missions: [{
        title: 'Wheels and Gears',
        preview: ['robot', 'motor', 'bushing', 'wobbling', 'M4', 'field', 'turns', 'into'],
        text: [
          'Our team needs a robot that can zoom.',
          'Each wheel gets a motor.',
          'We slide a steel hex shaft into the wheel.',
          'A bushing keeps the shaft from wobbling.',
          'Then we mount the gears with M4 screws and lock nuts.',
          'A small gear that turns a big gear makes the robot strong.',
          'A big gear that turns a small gear makes the robot fast.',
          'Now the robot can zoom down the field!'
        ],
        q: [
          { q: 'What keeps the shaft from wobbling?', choices: ['a bushing', 'a battery', 'a sheep'], a: 0 },
          { q: 'What size screws mount the gears?', choices: ['M3', 'M4', '10 mm'], a: 1 },
          { q: 'A small gear turns a big gear. The robot gets...', choices: ['strong', 'fast', 'wet'], a: 0 }
        ]
      }]
    },
    {
      id: 11, kind: 'words', name: 'Bossy R', cert: 'Arm and Power Tech',
      project: 'ftc', part: { name: 'Arm and Charger', e: '🦾', note: 'A servo arm with a claw, plus a charged battery.' },
      pattern: 'When r comes after a vowel, r is the boss and changes the sound: ar (arm), or (fork), er (her), ir (bird), ur (turn). Notice that er, ir, and ur all sound the same.',
      tricky: ['four', 'your', 'pour', 'sure', 'hour', 'build'],
      words: [
        { w: 'arm', e: '💪' }, { w: 'cart', e: '🛒' }, { w: 'star', e: '⭐' }, { w: 'car', e: '🚗' },
        { w: 'corn', e: '🌽' }, { w: 'storm', e: '⛈️' }, { w: 'shark', e: '🦈' }, { w: 'bird', e: '🐦' },
        { w: 'shirt', e: '👕' }, { w: 'fork', e: '🍴' }, { w: 'dart', e: '🎯' }, { w: 'chart', e: '📊' },
        { w: 'horn', e: '📯' }, { w: 'surf', e: '🏄' }, { w: 'card', e: '🃏' },
        { w: 'spark' }, { w: 'part' }, { w: 'charge' }, { w: 'port' }, { w: 'cord' }, { w: 'turn' },
        { w: 'burn' }, { w: 'start' }, { w: 'short' }, { w: 'sort' }, { w: 'her' }, { w: 'first' },
        { w: 'charger' }, { w: 'bar' }, { w: 'hard' }, { w: 'sport' }
      ],
      missions: [{
        title: 'The Arm and the Charger',
        preview: ['robot', 'metal', 'servo', 'battery', 'means', 'green', 'ready', 'claw', 'into'],
        text: [
          'The robot needs an arm to grab parts.',
          'Sam builds the arm out of a short metal bar.',
          'A servo turns the arm. A servo can stop at a set point and hold.',
          'The servo turns, and the claw grips the part.',
          'Next, Sam must charge the battery.',
          'She plugs the charger into the port. The light turns red. That means it is charging.',
          'When the light turns green, the battery is charged and ready.',
          'Now the robot is set for the first match!'
        ],
        q: [
          { q: 'What turns the arm?', choices: ['a horn', 'a servo', 'a cart'], a: 1 },
          { q: 'What color means the battery is charged?', choices: ['red', 'black', 'green'], a: 2 },
          { q: 'What does the arm grab?', choices: ['parts', 'corn', 'stars'], a: 0 }
        ]
      }]
    },
    {
      id: 12, kind: 'words', name: 'Big Words', cert: 'Robot Systems Tech',
      project: 'ftc', part: { name: 'Control Hub and Sensors', e: '🧠', note: 'The brain and senses of the robot.' },
      pattern: 'Big words are just small parts glued together. Split the word into chunks (syllables). Each chunk has one vowel sound. Read each chunk, then put them together: bat - ter - y ... battery!',
      tricky: ['every', 'energy', 'distance', 'angle', 'answer'],
      words: [
        { w: 'robot', syl: 'ro-bot', e: '🤖' }, { w: 'battery', syl: 'bat-ter-y', e: '🔋' },
        { w: 'magnet', syl: 'mag-net', e: '🧲' }, { w: 'camera', syl: 'cam-er-a', e: '📷' },
        { w: 'computer', syl: 'com-pu-ter', e: '💻' }, { w: 'rocket', syl: 'rock-et', e: '🚀' },
        { w: 'hammer', syl: 'ham-mer', e: '🔨' }, { w: 'ladder', syl: 'lad-der', e: '🪜' },
        { w: 'basket', syl: 'bas-ket', e: '🧺' }, { w: 'button', syl: 'but-ton', e: '🔘' },
        { w: 'helmet', syl: 'hel-met', e: '⛑️' }, { w: 'tractor', syl: 'trac-tor', e: '🚜' },
        { w: 'pencil', syl: 'pen-cil', e: '✏️' }, { w: 'motor', syl: 'mo-tor' },
        { w: 'servo', syl: 'ser-vo' }, { w: 'sensor', syl: 'sen-sor' }, { w: 'metal', syl: 'met-al' },
        { w: 'lever', syl: 'lev-er' }, { w: 'pulley', syl: 'pul-ley' }, { w: 'bushing', syl: 'bush-ing' },
        { w: 'sprocket', syl: 'sprock-et' }, { w: 'gearbox', syl: 'gear-box' }, { w: 'solder', syl: 'sol-der' },
        { w: 'circuit', syl: 'cir-cuit' }, { w: 'current', syl: 'cur-rent' }, { w: 'nickel', syl: 'nick-el' },
        { w: 'plastic', syl: 'plas-tic' }, { w: 'rubber', syl: 'rub-ber' }, { w: 'engine', syl: 'en-gine' },
        { w: 'voltage', syl: 'volt-age' }, { w: 'lithium', syl: 'lith-i-um' }, { w: 'control', syl: 'con-trol' }
      ],
      missions: [{
        title: 'Inside the Robot',
        preview: ['brain', 'muscles', 'senses', 'away', 'wall', 'carry', 'food', 'hub'],
        text: [
          'Every robot has a brain, muscles, and senses.',
          'The control hub is the brain. It runs the code.',
          'Motors and servos are the muscles.',
          'A motor spins and spins. A servo turns to a set angle and holds.',
          'Sensors are the senses. A distance sensor can tell how far away a wall is.',
          'The battery is like food. It gives the robot energy.',
          'Wires carry current from the battery to the hub, and from the hub to the motors.'
        ],
        q: [
          { q: 'What is the brain of the robot?', choices: ['the battery', 'the control hub', 'a motor'], a: 1 },
          { q: 'Which part spins and spins?', choices: ['a motor', 'a servo', 'a sensor'], a: 0 },
          { q: 'What do wires carry?', choices: ['food', 'code', 'current'], a: 2 }
        ]
      }]
    },
    {
      id: 13, kind: 'words', name: 'Power Lab and Spec Sheets', cert: 'FTC Engineer',
      project: 'ftc', part: { name: 'Power System', e: '⚡', note: 'Battery, wiring, and the right hardware. Robot complete!' },
      pattern: 'Engineers use short codes. Read them letter by letter or as a word: AC and DC are said letter by letter. LiPo is said "lie-po". M3 is said "M three". mm means millimeters.',
      tricky: ['electricity', 'electron', 'alternating', 'chemistry', 'measure'],
      pickMode: 'meaning',
      words: [
        { w: 'volt',  say: 'volt',  def: 'how hard electricity pushes' },
        { w: 'amp',   say: 'amp',   def: 'how much electricity flows' },
        { w: 'watt',  say: 'watt',  def: 'how much power is used' },
        { w: 'AC',    say: 'A C',   def: 'current that flips back and forth (wall plug)' },
        { w: 'DC',    say: 'D C',   def: 'current that flows one way (battery)' },
        { w: 'LED',   say: 'L E D', def: 'a tiny light that only works one way' },
        { w: 'NiMH',  say: 'N I M H, nickel metal hydride', def: 'the battery type used on FTC robots' },
        { w: 'LiPo',  say: 'lie po, lithium polymer', def: 'a light, strong battery that needs care' },
        { w: 'Li-ion', say: 'lithium ion', def: 'the battery type in most phones' },
        { w: 'M3',    say: 'M 3',   def: 'a bolt 3 millimeters wide' },
        { w: 'M4',    say: 'M 4',   def: 'a bolt 4 millimeters wide' },
        { w: '6 mm',  say: '6 millimeters', def: 'a little more than the width of a pencil' },
        { w: '10 mm', say: '10 millimeters', def: 'the same as 1 centimeter' },
        { w: 'hex',   say: 'hex',   def: 'six sides' },
        { w: 'omni',  say: 'om nee', def: 'a wheel with rollers so it can slide sideways' },
        { w: 'lock nut', say: 'lock nut', def: 'a nut with a ring inside so it will not shake loose' },
        { w: 'power', say: 'power', def: 'volts times amps' },
        { w: 'motion', say: 'motion', def: 'when something moves' },
        { w: 'charge', say: 'charge', def: 'to fill a battery with energy' }
      ],
      missions: [{
        title: 'The Power Lab',
        preview: ['electricity', 'electrons', 'voltage', 'current', 'measure', 'alternating', 'direct', 'chemistries', 'hydride', 'polymer', 'overcharged', 'phone'],
        text: [
          'Electricity is tiny charges called electrons on the move.',
          'Voltage is the push. Current is how much flows. We measure current in amps.',
          'Power is voltage times current. We measure power in watts.',
          'An FTC battery is 12 volts. If a motor pulls 2 amps, it uses 12 x 2 = 24 watts.',
          'A wall plug gives AC, alternating current. It flips back and forth.',
          'A battery gives DC, direct current. It flows one way.',
          'Batteries come in different chemistries. The FTC robot battery is NiMH: nickel metal hydride.',
          'LiPo means lithium polymer. LiPo packs are light and strong, but they can catch fire if they are hurt or overcharged. Always use the right charger!',
          'Li-ion means lithium ion. Your phone has one.'
        ],
        q: [
          { q: '12 volts x 3 amps = ? watts', choices: ['15', '36', '9'], a: 1 },
          { q: 'Which current flows one way?', choices: ['AC', 'DC'], a: 1 },
          { q: 'What kind of battery does an FTC robot use?', choices: ['LiPo', 'Li-ion', 'NiMH'], a: 2 }
        ]
      }, {
        title: 'Nuts, Bolts, and Shafts',
        preview: ['metric', 'millimeters', 'millimeter', 'centimeter', 'nylon', 'inside', 'loose', 'wrench', 'across'],
        text: [
          'Metric bolts use M sizes. M3 means the bolt is 3 millimeters wide.',
          'An M4 bolt is 4 millimeters wide. It is a bit bigger and stronger.',
          'A millimeter is tiny. Ten millimeters make one centimeter.',
          'A hex nut has six sides. Hex means six.',
          'A lock nut has a nylon ring inside. The ring grips the bolt so it will not shake loose.',
          'We turn nuts with a wrench. An M3 nut needs a 5.5 mm wrench. An M4 nut needs a 7 mm wrench.',
          'Many FTC hex shafts are 5 mm across, so the wheel and the shaft spin as one.'
        ],
        q: [
          { q: 'An M4 bolt is how wide?', choices: ['4 mm', '4 cm', '40 mm'], a: 0 },
          { q: 'How many sides does a hex nut have?', choices: ['4', '6', '8'], a: 1 },
          { q: 'What stops a lock nut from shaking loose?', choices: ['a spring', 'glue', 'a nylon ring'], a: 2 }
        ]
      }]
    }
  ],

  projects: {
    egg: { name: 'Egg Harvester', e: '🥚', blurb: 'Build a machine that collects eggs from the hen house.' },
    rc:  { name: 'RC Car Repair', e: '🚗', blurb: 'Fix the wiring, solder it, and light up the LEDs.' },
    ftc: { name: 'FTC Robot',     e: '🤖', blurb: 'Build a competition robot from the wheels up.' }
  },

  // Keyword for each sound chunk, used by the free Decoder tool.
  // Tapping a chunk says the keyword so he can hear the sound in a word he knows.
  hints: {
    a: 'ax', e: 'egg', i: 'inch', o: 'on', u: 'up',
    a_e: 'gate', e_e: 'these', i_e: 'wire', o_e: 'hose', u_e: 'tube',
    b: 'battery', c: 'car', d: 'dig', f: 'fire', g: 'gear', h: 'hammer', j: 'jet', k: 'key',
    l: 'lamp', m: 'magnet', n: 'nut', p: 'plug', r: 'robot', s: 'saw', t: 'tractor', v: 'van',
    w: 'wheel', x: 'box', y: 'yo-yo', z: 'zap', qu: 'quack',
    sh: 'ship', ch: 'chip', th: 'thin', wh: 'wheel', ck: 'lock', ng: 'ring', nk: 'tank', tch: 'switch',
    ll: 'bell', ss: 'mess', ff: 'off', zz: 'buzz', ph: 'phone', wr: 'wrench', kn: 'knot',
    ee: 'steel', ea: 'beam', ai: 'chain', ay: 'spray', oa: 'boat', oo: 'tool', oi: 'coil', oy: 'toy',
    aw: 'saw', au: 'August', ow: 'power', ou: 'mount', ew: 'screw', igh: 'light',
    ar: 'arm', or: 'fork', er: 'her', ir: 'bird', ur: 'turn'
  }
};
