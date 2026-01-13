import Notification from "../models/Notification.js"

// CREATE NOTIFICATION
export const createNotification = async (userId, message, type) => {
  await Notification.create({ userId, message, type })
}

// GET USER NOTIFICATIONS
export const getNotifications = async (req, res) => {
  const notifications = await Notification.find({
    userId: req.user.id
  })

  res.json(notifications)
}

// MARK AS READ
export const markAsRead = async (req, res) => {
  await Notification.findByIdAndUpdate(req.params.id, { isRead: true })
  res.json({ message: "Notification marked as read" })
}
