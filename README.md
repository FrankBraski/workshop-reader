# Workshop Reader

Phonics and reading practice built around engineering: an egg harvester, an RC car repair, and an FTC robot. The student earns "certifications" and machine parts by reading.

It runs in any web browser. Nothing gets installed on his computer.

## What's in the folder

| File | What it is |
|---|---|
| `index.html` | The app page (also holds the look and colors) |
| `app.js` | How the app works |
| `curriculum.js` | **All the words, lessons, and stories.** Edit this to add words. |
| `config.js` | Settings: report link, teacher PIN, radio battery rules |
| `apps-script/Code.gs` | Goes in a Google Sheet. Receives his results, builds the status page, sends emails. |

## How it teaches

**13 levels, in phonics order:** vowel sounds → consonants → short-vowel words → digraphs (sh, ch, th, ck, ng) → blends → magic e → vowel teams → bossy r → big words → FTC Power Lab (volts, amps, watts, AC/DC, NiMH/LiPo/Li-ion, M3/M4, mm).

**Jobs in each level:**
- **Sound Check / Letter Match** (levels 1-4): connect sounds and letters.
- **Spot the Part:** hear a word, find it among look-alikes (pin / pan / pen). Trains careful decoding.
- **Typing Bay:** hear a word, type it. Spelling is the other half of reading, and typing makes it a keyboard skill too. If he misses, he sees the word in color-coded sound chunks and copies it.
- **Read and Pick:** read a word *on his own* and pick its picture (or meaning, at level 13).
- **Missions:** short stories using only the patterns he has learned, then comprehension questions.

**🤖 Teach Your Droid (learning by teaching).** He builds a protocol droid that can talk but can't read. In every level, one job is teaching it:
- The droid "reads" a word out loud in a robot voice. Sometimes it's right, and sometimes it makes a realistic mistake (*kit* for *kite*, *pig* for *dig*). He has to read the word himself to judge: ✅ Right or ❌ Wrong.
- When he catches a mistake, he **reprograms** the droid by reading the word out loud into the microphone (Edge and Chrome). If the mic doesn't hear him, he can type it instead. Reading out loud earns bonus XP.
- Every word he teaches goes into the droid's "memory banks." At 10, 25, 45, 70, 100, 140, and 200 words, the droid gets new parts: photoreceptors, vocabulator, servo arms, legs, memory core, gold plating, and an antenna.
- This flips the old setup: the computer is no longer reading *to* him. He's the expert, and the droid depends on him.
- Click the droid on the home screen and it reports how many words it knows and what part comes next.
- The droid is original (no movie names or pictures) so the public site stays out of trademark trouble. He can name it whatever he wants.
- The microphone check is lenient on purpose. Speech recognition struggles with kids' voices, and the judging step is what's scored, not the mic. The first time he uses it, the browser asks permission to use the microphone.

**Weaning off read-aloud: the 📻 Radio battery.**
- Read-aloud help is still there, but each use costs battery (10% per word, 20% per line).
- Reading on his own **recharges** it, and earns bonus XP.
- The battery gets smaller as he levels up (100 → 80 → 60 → 50), so help fades out gradually.
- When the battery is empty, he can still use the **🧩 Decoder**, which is always free. It splits the word into color-coded sound chunks. Tapping a chunk plays a keyword (for example "sh" plays "ship"), so he hears the *sound*, but he has to blend the word himself.
- Brand-new words above his level are dotted-underlined in missions and are free to hear. That way he never gets stuck on a word like "solder" that he hasn't been taught yet.

Every level page explains its rule and lists its **❤️ heart words**: common words like *the*, *said*, and *was* that break the rules and are learned by heart.

**Tip:** run it in **Microsoft Edge**. Edge has much more natural voices (such as "Aria") than Chrome does on Windows.

**Introducing it:** call it his "engineering certification program," not reading help. Have him sit with you for the first Sound Check so he sees what to do. For a kid who's used to having everything read to him, starting at level 1 should feel *easy*. That's the point: early wins rebuild confidence. You can skip ahead in the Teacher panel if it's too easy.

---

## Step 1: Put it on GitHub Pages (about 10 minutes, no software needed)

1. Sign in at github.com, click **+** (top right) → **New repository**. Name it `workshop-reader`, set it to **Public**, and click **Create repository**.
2. On the new repo page, click **uploading an existing file**. Drag in `index.html`, `app.js`, `curriculum.js`, `config.js`, and `README.md`. (You don't need to upload the `apps-script` folder; it never runs on GitHub.) Click **Commit changes**.
3. Go to **Settings** → **Pages**. Under "Branch," pick **main** and **/ (root)**, then **Save**.
4. Wait a minute or two. The site will be at `https://YOUR-USERNAME.github.io/workshop-reader/`. Bookmark that on his PC, or pin it to his taskbar from Edge (**… → Apps → Install this site as an app**).

Your teacher's PIN is in `config.js` (default `2468`). Change it before uploading. The PIN is only a speed bump, since anyone can read the public file.

## Step 2: Get his results (Google Sheet + email), about 10 minutes

1. Use your **school** Google account if you can. Create a new Google Sheet named `Workshop Reader Progress`.
2. In the Sheet: **Extensions → Apps Script**. Delete what's there and paste all of `apps-script/Code.gs`.
3. At the top of the script, edit:
   - `TOKEN`: make up a word, like `gears-and-eggs-42`.
   - `TEACHER_EMAIL`: your email (gets an instant note when he earns a certification).
   - `DIGEST_EMAILS`: everyone who should get the daily summary. Example: `['you@school.org', 'parent@gmail.com', 'sister@gmail.com']`.
4. Click **💾 Save**. Then click **Deploy → New deployment**, click the gear ⚙ → **Web app**, and set:
   - Execute as: **Me**
   - Who has access: **Anyone** (this lets the app send reports; nobody can *read* your Sheet through it)
   - Click **Deploy**, then **Authorize access**. Google will warn that the app isn't verified. Click **Advanced → Go to (project name)**. That's normal for your own scripts.
5. Copy the **Web app URL** (it ends in `/exec`).
6. In `config.js`, paste it into `reportUrl` and put your made-up word in `token`. Then upload the new `config.js` to GitHub (open the file on GitHub → pencil ✏️ → paste → **Commit**).
7. Daily email: in Apps Script, choose `setupDailyEmail` from the function dropdown and click **▶ Run** once. He'll get a summary each evening that he practices; no practice means no email.
8. Test it: in the app, open **Teacher panel → Send test report**. A row should appear in the **Log** tab within a few seconds.

If you ever change `Code.gs`, use **Deploy → Manage deployments → ✏️ → Version: New version → Deploy**. That keeps the same URL.

## Step 3: The status page for family and teachers

The **Dashboard** tab in the Sheet rebuilds itself after every job. It shows: last practice, highest level, words read on his own, minutes this week, average score, how often he used the radio, words to practice, and recent jobs.

To share it, click **Share** on the Sheet, add parents, his sister, and teachers as **Viewer**. Google handles who can see it, which is much safer than a public web page about a minor.

The number to watch is **radio calls per job going down** while **words read alone goes up**. That's the learned helplessness fading.

## Privacy notes

- The app sends only: the name he types at sign-in, scores, time, missed words, and radio use. No email addresses, no location.
- The GitHub site is public, but it contains no student data. His results go only to your Google Sheet.
- Consider using a nickname at sign-in, and check your school's policy on student data in personal Google accounts (FERPA). That's another reason to use your school account in Step 2.
- Progress is saved in his browser. If he switches computers or browsers, use **Teacher panel → Download progress backup / Restore backup**. Clearing browser data erases progress, so make an occasional backup.

## Customizing

- **Add words:** in `curriculum.js`, add `{ w: 'winch' }` to the right level. Add `e: '🪝'` to give it a picture. Keep words in the level whose pattern they use.
- **Add a mission:** copy a `missions` entry. Use only that level's patterns plus heart words. Put anything harder in `preview`.
- **Harder/easier:** in `config.js`, change `roundSize`, `passScore`, and the radio costs.
- **More students:** each student just uses the same link on their own computer. The Dashboard groups by sign-in name. Your English learners can use the same levels.
