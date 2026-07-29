/**
 * Cousin — "update me" opt-in capture endpoint (Google Apps Script)
 * -----------------------------------------------------------------
 * This script is BOUND to the dedicated opt-in Google Sheet
 * (https://docs.google.com/spreadsheets/d/1l1Ryn28e296PItWO9bXfFKTpVWYwYg2KKj5itXQYA0I)
 * via Extensions -> Apps Script from inside that sheet, deployed as a
 * Web App, and its /exec URL is pasted into index.html as
 * UPDATES_ENDPOINT.
 *
 * Separate from apps-script/submissions.gs, which logs every add-name
 * submission (story or photo) regardless of the opt-in checkbox. This
 * endpoint only gets called when the user checked "Update me on Cousin
 * Magazine print releases and parties" — so this sheet stays a clean
 * contact list, without needing to filter the full submissions log.
 *
 * Posts { name, email, phone } (application/x-www-form-urlencoded,
 * mode:"no-cors").
 *
 * DEPLOY / REDEPLOY (same as subscribers.gs):
 *   Deploy -> New deployment -> type: Web app
 *     Execute as: Me
 *     Who has access: Anyone   <-- required, or the site can't reach it
 *   Approve the auth prompt ("Google hasn't verified this app" ->
 *   Advanced -> Go to project -> Allow).
 *
 * IMPORTANT: every NEW deployment creates a NEW /exec URL. If you
 * redeploy, copy the new URL and update UPDATES_ENDPOINT in
 * index.html. To keep the same URL, use Deploy -> Manage deployments
 * -> Edit (pencil) -> New version, instead of "New deployment".
 *
 * Sheet layout (row 1 headers): A = Timestamp, B = Name, C = Email, D = Phone
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
      sheet.appendRow([new Date(), name, email, p.phone || '']);
    }
    return ContentService.createTextOutput('ok');
  } catch (err) {
    return ContentService.createTextOutput('error');
  } finally {
    lock.releaseLock();
  }
}
