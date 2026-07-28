/**
 * Cousin — subscriber capture endpoint (Google Apps Script)
 * ---------------------------------------------------------
 * This script is BOUND to the "Cousin subscribers" Google Sheet
 * (Extensions -> Apps Script from inside that sheet), deployed as a
 * Web App, and its /exec URL is pasted into index.html as SHEET_ENDPOINT.
 *
 * The landing page posts { email } (application/x-www-form-urlencoded,
 * mode:"no-cors") to this endpoint; doPost appends a timestamped row.
 *
 * DEPLOY / REDEPLOY:
 *   Deploy -> New deployment -> type: Web app
 *     Execute as: Me
 *     Who has access: Anyone   <-- required, or the site can't reach it
 *   Approve the auth prompt ("Google hasn't verified this app" ->
 *   Advanced -> Go to project -> Allow).
 *
 * IMPORTANT: every NEW deployment creates a NEW /exec URL. If you
 * redeploy, copy the new URL and update SHEET_ENDPOINT in index.html.
 * To keep the same URL, use Deploy -> Manage deployments -> Edit
 * (pencil) -> New version, instead of "New deployment".
 *
 * Sheet layout (row 1 headers): A = Timestamp, B = Email
 */
function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
    var email = (e && e.parameter && e.parameter.email) ? e.parameter.email.trim() : '';
    if (email) {
      sheet.appendRow([new Date(), email]);
    }
    return ContentService.createTextOutput('ok');
  } catch (err) {
    return ContentService.createTextOutput('error');
  } finally {
    lock.releaseLock();
  }
}
