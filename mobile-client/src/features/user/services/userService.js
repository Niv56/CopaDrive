import { apiRequest } from "../../../shared_code/hooks/api/request";

export async function updateUserProfile(token, userId, patch) {
  return apiRequest(`/api/users/${userId}`, {
    method: "PATCH",
    token,
    body: patch,
  });
}

export async function changeUserPassword(token, userId, currentPassword, newPassword) {
  return apiRequest(`/api/users/${userId}/password`, {
    method: "POST",
    token,
    body: { currentPassword, newPassword },
  });
}
