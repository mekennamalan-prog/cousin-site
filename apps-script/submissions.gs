/**
 * Cousin — story/cover submission capture endpoint (Google Apps Script)
 * -----------------------------------------------------------------
 * This script is BOUND to the submissions Google Sheet
 * (https://docs.google.com/spreadsheets/d/17nisAAGCR9J0GsUyBOZStmVw082kA6LIbTp_lH-3gN8)
 * via Extensions -> Apps Script from inside that sheet, deployed as a
 * Web App, and its /exec URL is pasted into index.html as
 * SUBMISSIONS_ENDPOINT.
 *
 * The "add name" step of the easter-egg story/cover flow posts
 * { type, name, email, phone, updates, story } (application/x-www-
 * form-urlencoded, mode:"no-cors") to this endpoint; doPost appends a
 * timestamped row. type is "story" or "photo" depending on which flow
 * the user came from. story holds the actual pitch text for story
 * submissions (empty for photo submissions — the cover photo itself
 * isn't sent here, only the reviewer sees it in-browser unless saved).
 * updates is "yes"/"no" for the print-releases-and-parties opt-in
 * checkbox — when "yes", index.html ALSO posts to the existing
 * subscribers sheet/script (SHEET_ENDPOINT, same one the footer email
 * signup uses), so this column is just a record of what was checked
 * at submission time.
 *
 * DEPLOY / REDEPLOY (same as subscribers.gs):
 *   Deploy -> New deployment -> type: Web app
 *     Execute as: Me
 *     Who has access: Anyone   <-- required, or the site can't reach it
 *   Approve the auth prompt ("Google hasn't verified this app" ->
 *   Advanced -> Go to project -> Allow).
 *
 * IMPORTANT: every NEW deployment creates a NEW /exec URL. If you
 * redeploy, copy the new URL and update SUBMISSIONS_ENDPOINT in
 * index.html. To keep the same URL, use Deploy -> Manage deployments
 * -> Edit (pencil) -> New version, instead of "New deployment".
 *
 * Sheet layout (row 1 headers):
 *   A = Timestamp, B = Type, C = Name, D = Email, E = Phone,
 *   F = Updates opt-in, G = Story text
 */
function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
    var p = (e && e.parameter) ? e.parameter : {};
    var name = (p.name || '').trim();
    var email = (p.email || '').trim();
    if (name && email) {
      sheet.appendRow([new Date(), p.type || '', name, email, p.phone || '', p.updates || 'no', p.story || '']);
    }
    return ContentService.createTextOutput('ok');
  } catch (err) {
    return ContentService.createTextOutput('error');
  } finally {
    lock.releaseLock();
  }
}
