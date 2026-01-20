const mongoose = require('mongoose');
const Schema = mongoose.Schema; 
const userSchema = new Schema({
    // First name
  firstName: { type: String, required: true }, 
    // Last name
  lastName: { type: String, default: '' },
    // Email
  email: { type: String, required: true, unique: true }, 
    //Phone number
  phoneNumber: { type: String, required: true },
    // Password
  password: { type: String, required: true }, 
    // Image
  image: { type: String, default: '' },
    // Birthday date
  dateOfBirth: { type: String, required: true },
    // Gender
  gender: { type: String, required: true },
    // Last login 
  lastLogin: { type: Date, default: Date.now } 
});

userSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id; // Removes the version with the underscore
  }
});

userSchema.set('toObject', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id; // Removes the version with the underscore
  }
});

// Export  the model that we can use it in the other parts of the code
module.exports = mongoose.model('User', userSchema);