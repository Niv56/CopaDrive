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