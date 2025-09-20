const cron = require('node-cron');
const User = require('../models/User');
const { sendFitnessReminder } = require('../services/notificationService');

function isToday(dateStr) {
  const today = new Date().toISOString().split('T')[0];
  return dateStr === today;
}

cron.schedule('0 8 * * *', async () => {
  const users = await User.find({});
  for (const user of users) {
    let remindersChanged = false;
    let sentToday = user._reminderSentToday || {};

    // Remove expired reminders and send notifications
    const newReminders = [];
    for (const reminder of user.reminders) {
      if (reminder.date < new Date().toISOString().split('T')[0]) {
        // Expired: do not keep
        remindersChanged = true;
        // Send expiration notification
        await sendFitnessReminder(
          user.email,
          `Your reminder "${reminder.title}" (for ${reminder.date}) has expired.`
        );
      } else {
        newReminders.push(reminder);
        // If reminder is today and not sent yet, send email
        if (
          isToday(reminder.date) &&
          (!sentToday[reminder.date] || !sentToday[reminder.date][reminder._id])
        ) {
          await sendFitnessReminder(
            user.email,
            `Reminder: ${reminder.title}\n${reminder.description || ''}\nTime: ${reminder.time || ''}`
          );
          // Mark as sent for today
          sentToday[reminder.date] = sentToday[reminder.date] || {};
          sentToday[reminder.date][reminder._id] = true;
        }
      }
    }

    // Save only if reminders changed or sentToday updated
    if (remindersChanged || user._reminderSentToday !== sentToday) {
      user.reminders = newReminders;
      user._reminderSentToday = sentToday;
      await user.save();
    }
  }
});