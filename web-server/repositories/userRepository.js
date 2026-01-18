const User = require('../models/user');

// Find a user by their unique ID
const findById = async (id) =>{
  return await User.findById(id);
} 

// Find a user by email
const findByEmail = async (email) => {
  return await User.findOne({email: email})
};

// Create a new user
const create = async (userData) => {
  const newUser = new User(userData);
  return await newUser.save()
  };

const update = async (id ,patch ) =>{
  return await User.findByIdAndUpdate(id, patch, { new: true });
}

module.exports = {
  findById,
  findByEmail,
  create,
  update
};