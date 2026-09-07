// Mock of src/services/database.js — mirrors the same method surface (see module.exports in database.js)
const methods = [
  'createUser',
  'getUserById',
  'getUserByEmail',
  'createRefreshToken',
  'getRefreshToken',
  'revokeRefreshToken',
  'revokeAllUserTokens',
  'updateUserPassword',
  'createPasswordResetToken',
  'getValidPasswordResetToken',
  'markPasswordResetUsed',
  'getUserByGoogleId',
  'getOrCreateGoogleUser',
  'getProfile',
  'updateProfile',
  'createBusiness',
  'getBusiness',
  'getBusinessBySlug',
  'getBusinessByOwnerId',
  'updateBusiness',
  'getServices',
  'getService',
  'createService',
  'updateService',
  'deleteService',
  'getServiceProfessionals',
  'getNextAvailableSlot',
  'setServiceProfessionals',
  'getSchedules',
  'upsertSchedule',
  'deleteSchedule',
  'getAppointments',
  'getAppointment',
  'createAppointment',
  'updateAppointment',
  'cancelAppointment',
  'checkAppointmentOverlap',
  'createPayment',
  'updatePayment',
  'getPaymentByStripeId',
  'createNotification',
  'updateNotification',
  'getNotification',
  'getAvailableSlots'
]

const db = {}
for (const method of methods) {
  db[method] = jest.fn()
}

// Sensible default for getAvailableSlots so "no schedules" fast-fails are not the test's concern
db.getAvailableSlots.mockResolvedValue([])

module.exports = db