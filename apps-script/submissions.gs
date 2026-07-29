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
 * form-urlencoded, mode:"no-cors") to this endpoint. type is "story"
 * or "photo" depending on which flow the user came from:
 *
 *   - "story" submissions are emailed straight to hello@cousinmag.com
 *     (via MailApp, sent from whichever account this script is
 *     deployed under) instead of being logged to the sheet — the
 *     pitch text itself is in the story field. Reply-to is set to the
 *     submitter's email so hitting "reply" goes straight to them.
 *   - "photo" submissions still append a row to the sheet, same as
 *     before (the cover photo itself isn't sent here — only the
 *     reviewer sees it in-browser unless the user saves it).
 *
 * updates is "yes"/"no" for the print-releases-and-parties opt-in
 * checkbox — when "yes", index.html ALSO posts to the existing
 * subscribers sheet/script (SHEET_ENDPOINT, same one the footer email
 * signup uses).
 *
 * DEPLOY / REDEPLOY:
 *   Deploy -> New deployment -> type: Web app
 *     Execute as: Me
 *     Who has access: Anyone   <-- required, or the site can't reach it
 *   Approve the auth prompt ("Google hasn't verified this app" ->
 *   Advanced -> Go to project -> Allow). The FIRST time you add
 *   MailApp usage, you'll get an extra permission prompt for sending
 *   email as you — approve that too.
 *
 * IMPORTANT: every NEW deployment creates a NEW /exec URL. If you
 * redeploy, copy the new URL and update SUBMISSIONS_ENDPOINT in
 * index.html. To keep the same URL, use Deploy -> Manage deployments
 * -> Edit (pencil) -> New version, instead of "New deployment".
 *
 * Sheet layout (row 1 headers, photo submissions only):
 *   A = Timestamp, B = Type, C = Name, D = Email, E = Phone, F = Updates opt-in
 */
function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    var p = (e && e.parameter) ? e.parameter : {};
    var name = (p.name || '').trim();
    var email = (p.email || '').trim();
    var type = p.type || '';

    if (name && email && type === 'story') {
      var story = p.story || '';
      MailApp.sendEmail({
        to: 'hello@cousinmag.com',
        replyTo: email,
        subject: 'New story pitch from ' + name + ' (cousinmag.com)',
        body: 'Name: ' + name + '\n' +
              'Email: ' + email + '\n' +
              'Phone: ' + (p.phone || '(not provided)') + '\n' +
              'Wants updates: ' + (p.updates || 'no') + '\n\n' +
              'Story:\n' + story
      });
    } else if (name && email) {
      var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
      sheet.appendRow([new Date(), type, name, email, p.phone || '', p.updates || 'no']);
    }
    return ContentService.createTextOutput('ok');
  } catch (err) {
    return ContentService.createTextOutput('error');
  } finally {
    lock.releaseLock();
  }
}
