const userService = require('../services/userService');
const {
  validateFields,
  validateNonEmptyString,
  validateDateOfBirth,
  validateGender
} = require('../utils/validation');

exports.registerUser = (req, res, next) => {
  try {
    const required = ['firstName', 'email', 'phoneNumber', 'password', 'dateOfBirth', 'gender'];
    validateFields(req.body, required);

    // If profilePicture is provided, validate it's a string
    if (req.body.profilePicture) {
      validateNonEmptyString(req.body, 'profilePicture', 'profilePicture must be a non-empty string');
    }

    // ✅ DOB + Gender validations (moved to utils)
    validateDateOfBirth(req.body, 'dateOfBirth');
    validateGender(req.body, 'gender');

    const newUser = userService.registerUser(req.body);
    return res.status(201).json(newUser);
  } catch (err) {
    next(err);
  }
};

exports.getUserById = (req, res, next) => {
  try {
    const userId = req.params.id;
    const user = userService.getSafeUserById(userId);
    return res.status(200).json(user);
  } catch (err) {
    next(err);
  }
};

exports.getUserByEmail = (req, res, next) => {
  try {
    const { email } = req.params;
    const user = userService.getByEmail(email);
    if (!user) return res.status(404).json({ error: "User not found" });

    // חשיפת פרטים ציבוריים בלבד
    res.status(200).json({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      image: user.image
    });
  } catch (err) { next(err); }
};
exports.updateUser = (req, res, next) => {
  try {
    const userId = req.params.id;

    // ✅ self only
    if (!req.user || String(req.user.id) !== String(userId)) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const allowed = ['firstName', 'lastName', 'phoneNumber', 'image', 'profilePicture'];
    const patch = {};
    for (const k of allowed) {
      if (req.body[k] !== undefined) patch[k] = req.body[k];
    }

    // normalize image key
    if (patch.profilePicture && !patch.image) {
      patch.image = patch.profilePicture;
      delete patch.profilePicture;
    }

    const updated = userService.updateUserProfile(userId, patch);
    return res.status(200).json(updated);
  } catch (err) {
    next(err);
  }
};

exports.changePassword = (req, res, next) => {
  try {
    const userId = req.params.id;

    // ✅ self only
    if (!req.user || String(req.user.id) !== String(userId)) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const { currentPassword, newPassword } = req.body || {};
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "currentPassword and newPassword are required" });
    }

    userService.changePassword(userId, currentPassword, newPassword);
    return res.status(200).json({ message: "Password updated" });
  } catch (err) {
    next(err);
  }
};
