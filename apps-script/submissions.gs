/**
 * Cousin — story/cover submission capture endpoint (Google Apps Script)
 * -----------------------------------------------------------------
 * This is a STANDALONE script (not bound to any sheet). Deployed as a
 * Web App, its /exec URL is pasted into index.html as
 * SUBMISSIONS_ENDPOINT.
 *
 * The "add name" step of the easter-egg story/cover flow posts
 * { type, name, email, phone, updates, story, photo }
 * (application/x-www-form-urlencoded, mode:"no-cors") to this
 * endpoint. Every submission is emailed via MailApp, sent from
 * whichever account this script is deployed under, straight to
 * mekenna.malan@gmail.com — NOT hello@cousinmag.com. hello@ forwards
 * to that same personal inbox, so sending "from you to you" through
 * that forward gets silently deduped/hidden by Gmail; sending
 * directly to the personal inbox skips that loop. Reply-to is set to
 * the submitter's email so hitting "reply" goes straight to them.
 *
 *   - "story" submissions: the pitch text is in the email body
 *     (story field).
 *   - "photo" submissions: the composited cover image (a data: URL
 *     from canvas.toDataURL) is decoded and attached to the email as
 *     a PNG. Nothing is logged to a sheet for either type — the email
 *     itself is the only record.
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
    var type = p.type || '';
    if (!name || !email) {
      return ContentService.createTextOutput('ok');
    }

    var body = 'Name: ' + name + '\n' +
               'Email: ' + email + '\n' +
               'Phone: ' + (p.phone || '(not provided)') + '\n' +
               'Wants updates: ' + (p.updates || 'no') + '\n\n';

    var message = {
      to: 'mekenna.malan@gmail.com',
      replyTo: email,
      subject: 'New ' + (type || 'submission') + ' from ' + name + ' (cousinmag.com)',
    };

    if (type === 'photo' && p.photo) {
      var match = /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.*)$/.exec(p.photo);
      if (match) {
        var blob = Utilities.newBlob(Utilities.base64Decode(match[2]), match[1], 'cousin-cover.png');
        message.attachments = [blob];
        body += 'Cover photo attached.';
      } else {
        body += "Cover photo couldn't be read — no attachment.";
      }
    } else {
      body += 'Story:\n' + (p.story || '');
    }

    message.body = body;
    MailApp.sendEmail(message);

    return ContentService.createTextOutput('ok');
  } catch (err) {
    return ContentService.createTextOutput('error');
  } finally {
    lock.releaseLock();
  }
}
