/**
 * Cousin — story submission capture endpoint (Google Apps Script)
 * -----------------------------------------------------------------
 * Deployed as a standalone Web App; its /exec URL is pasted into
 * index.html as SUBMISSIONS_ENDPOINT.
 *
 * The story-writer flow posts { type, name, email, phone, updates,
 * story } (application/x-www-form-urlencoded, mode:"no-cors") to
 * this endpoint. Emails the pitch via MailApp, sent from whichever
 * account this script is deployed under, straight to
 * mekenna.malan@gmail.com — NOT hello@cousinmag.com. hello@ forwards
 * to that same personal inbox, so sending "from you to you" through
 * that forward gets silently deduped/hidden by Gmail; sending
 * directly to the personal inbox skips that loop and lands in the
 * same place you already read mail. Reply-to is set to the
 * submitter's email so hitting "reply" goes straight to them.
 *
 * Cover-photo submissions do NOT use this endpoint — see
 * apps-script/cover-submissions.gs, a deliberately separate script
 * and deployment, so redeploying that one can never affect this one.
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
 *   Advanced -> Go to project -> Allow).
 *
 * IMPORTANT: every NEW deployment creates a NEW /exec URL. If you
 * redeploy, copy the new URL and update SUBMISSIONS_ENDPOINT in
 * index.html. To keep the same URL, use Deploy -> Manage deployments
 * -> Edit (pencil) -> New version, instead of "New deployment".
 */
function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    var p = (e && e.parameter) ? e.parameter : {};
    var name = (p.name || '').trim();
    var email = (p.email || '').trim();

    if (name && email) {
      MailApp.sendEmail({
        to: 'mekenna.malan@gmail.com',
        replyTo: email,
        subject: 'New story pitch from ' + name + ' (cousinmag.com)',
        body: 'Name: ' + name + '\n' +
              'Email: ' + email + '\n' +
              'Phone: ' + (p.phone || '(not provided)') + '\n' +
              'Wants updates: ' + (p.updates || 'no') + '\n\n' +
              'Story:\n' + (p.story || '')
      });
    }
    return ContentService.createTextOutput('ok');
  } catch (err) {
    return ContentService.createTextOutput('error');
  } finally {
    lock.releaseLock();
  }
}
