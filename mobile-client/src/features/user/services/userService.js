import { request } from "../../../shared_code/hooks/api/request";

export async function getUserProfile(token, userId) {
  return request(`/api/users/${userId}`, {
    method: "GET",
    token: token
  });
}

export async function updateUserProfile(token, userId, patch) {
  return request(`/api/users/${userId}`, {
    method: "PATCH",
    token: token,
    body: patch,
  });
}

export async function changeUserPassword(token, userId, currentPassword, newPassword) {
  return request(`/api/users/${userId}/password`, {
    method: "PATCH",
    token: token,
    body: { currentPassword, newPassword },
  });
}

export async function getUserById(token, userId) {
  return request(`/api/users/${userId}`, {
    method: "GET",
    token,
  });
}