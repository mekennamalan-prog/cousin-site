/**
 * Cousin — cover photo submission capture endpoint (Google Apps Script)
 * -----------------------------------------------------------------
 * Deliberately a SEPARATE script/deployment from submissions.gs
 * (story pitches) — kept independent so redeploying this one can
 * never affect story submissions, and vice versa. Deployed as a
 * standalone Web App; its /exec URL is pasted into index.html as
 * COVER_ENDPOINT.
 *
 * The "capture a cover" flow posts { type, name, email, phone,
 * updates, photo } (application/x-www-form-urlencoded,
 * mode:"no-cors") to this endpoint, where photo is a data: URL (from
 * canvas.toDataURL) of the composited cover image. Decodes it and
 * emails it as a PNG attachment via MailApp, sent from whichever
 * account this script is deployed under, straight to
 * mekenna.malan@gmail.com — NOT hello@cousinmag.com, same reasoning
 * as submissions.gs (avoids Gmail deduping "from you to you" mail
 * sent through that forward). Reply-to is set to the submitter's
 * email so hitting "reply" goes straight to them.
 *
 * updates is "yes"/"no" for the print-releases-and-parties opt-in
 * checkbox — when "yes", index.html ALSO posts to the existing
 * subscribers sheet/script (SHEET_ENDPOINT, same one the footer email
 * signup uses).
 *
 * DEPLOY:
 *   Deploy -> New deployment -> type: Web app
 *     Execute as: Me
 *     Who has access: Anyone   <-- required, or the site can't reach it
 *   Approve the auth prompt ("Google hasn't verified this app" ->
 *   Advanced -> Go to project -> Allow). The FIRST time you add
 *   MailApp usage, you'll get an extra permission prompt for sending
 *   email as you — approve that too.
 *
 * IMPORTANT: every NEW deployment creates a NEW /exec URL. If you
 * redeploy, copy the new URL and update COVER_ENDPOINT in index.html.
 * To keep the same URL, use Deploy -> Manage deployments -> Edit
 * (pencil) -> New version, instead of "New deployment".
 */
function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    var p = (e && e.parameter) ? e.parameter : {};
    var name = (p.name || '').trim();
    var email = (p.email || '').trim();

    if (name && email) {
      var body = 'Name: ' + name + '\n' +
                 'Email: ' + email + '\n' +
                 'Phone: ' + (p.phone || '(not provided)') + '\n' +
                 'Wants updates: ' + (p.updates || 'no') + '\n\n';

      var message = {
        to: 'mekenna.malan@gmail.com',
        replyTo: email,
        subject: 'New cover photo from ' + name + ' (cousinmag.com)'
      };

      var match = /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.*)$/.exec(p.photo || '');
      if (match) {
        var blob = Utilities.newBlob(Utilities.base64Decode(match[2]), match[1], 'cousin-cover.png');
        message.attachments = [blob];
        body += 'Cover photo attached.';
      } else {
        body += "Cover photo couldn't be read — no attachment.";
      }

      message.body = body;
      MailApp.sendEmail(message);
    }
    return ContentService.createTextOutput('ok');
  } catch (err) {
    return ContentService.createTextOutput('error');
  } finally {
    lock.releaseLock();
  }
}
