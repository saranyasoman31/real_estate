const { pool } = require('../../config/db');

exports.getNotifications = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const notifications = await pool.query(
      `SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 30`,
      [userId]
    );

    const unreadCount = await pool.query(
      `SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND is_read = false`,
      [userId]
    );

    res.json({
      success: true,
      unreadCount: parseInt(unreadCount.rows[0].count, 10),
      data: notifications.rows
    });
  } catch (err) {
    next(err);
  }
};

exports.markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    await pool.query(
      `UPDATE notifications SET is_read = true WHERE id = $1 AND user_id = $2`,
      [id, req.user.id]
    );
    res.json({ success: true, message: 'Notification marked as read.' });
  } catch (err) {
    next(err);
  }
};

exports.markAllAsRead = async (req, res, next) => {
  try {
    await pool.query(
      `UPDATE notifications SET is_read = true WHERE user_id = $1`,
      [req.user.id]
    );
    res.json({ success: true, message: 'All notifications marked as read.' });
  } catch (err) {
    next(err);
  }
};
