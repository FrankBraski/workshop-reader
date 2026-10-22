/**
 * Workshop Reader - progress receiver (Google Apps Script)
 *
 * Paste this into Extensions > Apps Script of a new Google Sheet.
 * See README.md, "Step 2", for the full walkthrough.
 *
 * What it does:
 *   - Receives a small report each time he finishes a job in the app
 *   - Adds a row to the "Log" tab
 *   - Rebuilds a readable "Dashboard" tab (share the Sheet, view-only,
 *     with parents, sister, and teachers: that is the status page)
 *   - Emails a daily summary, and an instant email when he earns a certification
 */

// ---- SETTINGS: edit these ----
const TOKEN = 'change-me';                       // must match token in config.js
const TEACHER_EMAIL = 'you@example.com';         // gets the instant certification emails
const DIGEST_EMAILS = ['you@example.com'];       // daily summary: add parents, sister, teachers
const DIGEST_HOUR = 18;                          // 24-hour clock; 18 = 6 PM
const EMAIL_ON_CERTIFICATION = true;
// ------------------------------

const LOG_HEADERS = ['Time', 'Student', 'Event', 'Level', 'Level name', 'Job', 'Correct', 'Total', 'Score %',
  'Radio calls', 'Decoder uses', 'Minutes', 'Missed', 'Words read alone', 'XP', 'Battery %',
  'Droid words', 'Read aloud to droid'];

function doPost(e) {
  try {
    const d = JSON.parse(e.postData.contents);
    if (d.token !== TOKEN) return text_('bad token');
    const sh = sheet_('Log', LOG_HEADERS);
    sh.appendRow([
      new Date(d.ts || Date.now()), clean_(d.student), clean_(d.event), d.level || '', clean_(d.levelName),
      clean_(d.activity), num_(d.correct), num_(d.total), num_(d.pct), num_(d.radioUsed), num_(d.decoderUsed),
      d.seconds ? Math.round(d.seconds / 6) / 10 : '', clean_(d.missed), num_(d.soloWords), num_(d.xp), num_(d.battery),
      num_(d.droidWords), num_(d.readAloud)
    ]);
    if (d.event === 'level_complete' && EMAIL_ON_CERTIFICATION) {
      MailApp.sendEmail(TEACHER_EMAIL,
        `Workshop Reader: ${clean_(d.student)} earned "${clean_(d.activity)}"`,
        `${clean_(d.student)} finished Level ${d.level} (${clean_(d.levelName)}) and earned the "${clean_(d.activity)}" certification.\n` +
        `Words read on their own so far: ${num_(d.soloWords)}.\n\nDashboard: ${SpreadsheetApp.getActiveSpreadsheet().getUrl()}`);
    }
    buildDashboard();
    return text_('ok');
  } catch (err) {
    return text_('error: ' + err);
  }
}

function doGet() {
  return text_('Workshop Reader endpoint is running.');
}

// Rebuilds the Dashboard tab from the Log. Safe to run by hand any time.
function buildDashboard() {
  const log = sheet_('Log', LOG_HEADERS).getDataRange().getValues().slice(1);
  const dash = sheet_('Dashboard');
  dash.clear();
  const now = new Date(), weekAgo = new Date(now - 7 * 864e5);
  const students = [...new Set(log.map(r => r[1]))].filter(String);
  const out = [['Workshop Reader: status', '', '', '', '', '', '', ''],
    ['Updated ' + Utilities.formatDate(now, Session.getScriptTimeZone(), 'EEE MMM d, h:mm a'), '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['Student', 'Last practiced', 'Highest level done', 'Words read alone', 'Minutes (7 days)', 'Jobs (7 days)', 'Avg score (7 days)', 'Radio calls per job (7 days)']];
  const missedRows = [];
  students.forEach(s => {
    const rows = log.filter(r => r[1] === s);
    const acts = rows.filter(r => r[2] === 'activity');
    const week = acts.filter(r => new Date(r[0]) >= weekAgo);
    const certs = rows.filter(r => r[2] === 'level_complete');
    const last = rows[rows.length - 1];
    const avg = week.length ? Math.round(week.reduce((a, r) => a + (+r[8] || 0), 0) / week.length) + '%' : '-';
    const radio = week.length ? (week.reduce((a, r) => a + (+r[9] || 0), 0) / week.length).toFixed(1) : '-';
    const mins = Math.round(week.reduce((a, r) => a + (+r[11] || 0), 0));
    const lastSolo = [...rows].reverse().find(r => r[13] !== '');
    const lastDroid = [...rows].reverse().find(r => r[16] !== '' && r[16] != null);
    out.push([s, last ? last[0] : '', certs.length ? `Level ${Math.max(...certs.map(r => +r[3]))}` : 'none yet',
      `${lastSolo ? lastSolo[13] : 0} (droid knows ${lastDroid ? lastDroid[16] : 0})`, mins, week.length, avg, radio]);
    const counts = {};
    week.forEach(r => String(r[12]).split(',').map(w => w.trim()).filter(Boolean).forEach(w => counts[w] = (counts[w] || 0) + 1));
    const top = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 12).map(([w, n]) => `${w} (${n})`).join(', ');
    missedRows.push([s, top || 'none']);
  });
  out.push(['', '', '', '', '', '', '', ''], ['Words to practice this week (times missed)', '', '', '', '', '', '', '']);
  missedRows.forEach(r => out.push([r[0], r[1], '', '', '', '', '', '']));
  out.push(['', '', '', '', '', '', '', ''], ['Recent jobs', '', '', '', '', '', '', ''],
    ['Time', 'Student', 'Level', 'Job', 'Score', 'Radio calls', 'Minutes', '']);
  const recent = log.filter(r => r[2] === 'activity').slice(-15).reverse();
  recent.forEach(r => out.push([r[0], r[1], r[3], r[5], `${r[6]}/${r[7]}`, r[9], r[11], '']));

  const n = students.length, dateFmt = 'ddd mmm d, h:mm am/pm';
  dash.getRange(1, 1, out.length, 8).setValues(out);
  dash.getRange('A1').setFontSize(16).setFontWeight('bold');
  dash.getRange('A2').setFontColor('#666666');
  [4, 6 + n, 8 + 2 * n, 9 + 2 * n].forEach(r => dash.getRange(r, 1, 1, 8).setFontWeight('bold'));
  if (n) dash.getRange(5, 2, n, 1).setNumberFormat(dateFmt);
  if (recent.length) dash.getRange(10 + 2 * n, 1, recent.length, 1).setNumberFormat(dateFmt);
  dash.autoResizeColumns(1, 8);
  dash.setFrozenRows(0);
  SpreadsheetApp.getActiveSpreadsheet().setActiveSheet(dash);
}

// Sends one email per day summarizing today's practice. Run setupDailyEmail() once to schedule it.
function dailyDigest() {
  const log = sheet_('Log', LOG_HEADERS).getDataRange().getValues().slice(1);
  const tz = Session.getScriptTimeZone();
  const todayStr = Utilities.formatDate(new Date(), tz, 'yyyy-MM-dd');
  const todays = log.filter(r => Utilities.formatDate(new Date(r[0]), tz, 'yyyy-MM-dd') === todayStr && r[2] !== 'test');
  if (!todays.length) return; // no practice today, no email
  const byStudent = {};
  todays.forEach(r => (byStudent[r[1]] = byStudent[r[1]] || []).push(r));
  let body = '';
  Object.entries(byStudent).forEach(([s, rows]) => {
    const acts = rows.filter(r => r[2] === 'activity');
    const mins = Math.round(acts.reduce((a, r) => a + (+r[11] || 0), 0));
    const certs = rows.filter(r => r[2] === 'level_complete').map(r => r[5]);
    const radio = acts.reduce((a, r) => a + (+r[9] || 0), 0);
    const missed = [...new Set(acts.flatMap(r => String(r[12]).split(',').map(w => w.trim()).filter(Boolean)))];
    const solo = [...rows].reverse().find(r => r[13] !== '');
    body += `${s}\n` +
      `  Practiced about ${mins} minutes, ${acts.length} jobs.\n` +
      acts.map(r => `  - Level ${r[3]} ${r[5]}: ${r[6]}/${r[7]} (${r[8]}%), radio calls: ${r[9]}`).join('\n') + '\n' +
      (certs.length ? `  NEW CERTIFICATION: ${certs.join(', ')}\n` : '') +
      `  Read-aloud help used: ${radio} times.\n` +
      `  Words read out loud to their droid today: ${acts.reduce((a, r) => a + (+r[17] || 0), 0)}\n` +
      `  Words read on their own (total): ${solo ? solo[13] : 0}\n` +
      (missed.length ? `  Words to practice: ${missed.slice(0, 15).join(', ')}\n` : '') + '\n';
  });
  body += `Full dashboard: ${SpreadsheetApp.getActiveSpreadsheet().getUrl()}`;
  MailApp.sendEmail(DIGEST_EMAILS.join(','), `Workshop Reader: today's practice (${todayStr})`, body);
}

function setupDailyEmail() {
  ScriptApp.getProjectTriggers().filter(t => t.getHandlerFunction() === 'dailyDigest').forEach(t => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger('dailyDigest').timeBased().everyDays(1).atHour(DIGEST_HOUR).create();
}

// ---- helpers ----
function sheet_(name, headers) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    if (headers) { sh.appendRow(headers); sh.setFrozenRows(1); sh.getRange(1, 1, 1, headers.length).setFontWeight('bold'); }
  }
  return sh;
}
function text_(s) { return ContentService.createTextOutput(s).setMimeType(ContentService.MimeType.TEXT); }
function clean_(v) { return v == null ? '' : String(v).slice(0, 500).replace(/^[=+\-@]/, "'$&"); }
function num_(v) { return v === '' || v == null || isNaN(+v) ? '' : +v; }
