/* Workshop Reader - settings. Edit these after you set up the Google Sheet
 * (see README.md, "Step 2"). Everything works without them; progress just
 * stays on his computer until reportUrl is filled in.
 */
window.WR_CONFIG = {
  // Web app URL from Google Apps Script (ends in /exec). Leave '' to turn reporting off.
  reportUrl: '',

  // Must match TOKEN in apps-script/Code.gs. Any made-up word is fine.
  token: 'change-me',

  // PIN for the Teacher panel (bottom of the home screen). This is NOT real
  // security, just enough to keep curious fingers out.
  teacherPin: '2468',

  // Items per practice round, and the score needed to pass (0.8 = 80%).
  roundSize: 10,
  passScore: 0.8,

  // Radio (read-aloud help). Costs are in battery %.
  radio: {
    wordCost: 10,
    sentenceCost: 20,
    questionCost: 5,
    dailyRecharge: 30,
    // Max battery by level: the help gets smaller as he grows.
    maxByLevel: { 1: 100, 7: 80, 10: 60, 13: 50 }
  }
};
