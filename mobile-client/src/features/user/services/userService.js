import { request } from "../../../shared_code/hooks/api/request";

/**
 * User Service
 * Manages API requests related to user profiles and account security.
 */

// Fetch the complete profile of the authenticated user
export async function getUserProfile(token, userId) {
  return request(`/api/users/${userId}`, {
    method: "GET",
    token: token
  });
}

// Update user metadata (name, phone, profile picture)
export async function updateUserProfile(token, userId, patch) {
  return request(`/api/users/${userId}`, {
    method: "PATCH",
    token: token,
    body: patch,
  });
}

// Handle secure password rotation
export async function changeUserPassword(token, userId, currentPassword, newPassword) {
  return request(`/api/users/${userId}/password`, {
    method: "PATCH",
    token: token,
    body: { currentPassword, newPassword },
  });
}

// Fetch basic user information by ID (used for shared files/owners)
export async function getUserById(token, userId) {
  return request(`/api/users/${userId}`, {
    method: "GET",
    token,
  });
}