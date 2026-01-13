import React, { useEffect, useMemo, useRef, useState } from "react";
import { changeUserPassword, updateUserProfile } from "features/drive/api/filesApi";
import { getProfilePicture, validateProfilePicture } from "shared/utils/profileUtils";

// Helper to check if two objects are superficially different
const shallowEqual = (a, b) => {
  const ak = Object.keys(a), bk = Object.keys(b);
  if (ak.length !== bk.length) return false;
  for (const k of ak) if (a[k] !== b[k]) return false;
  return true;
};

/**
 * EditUserModal
 * Handles updating user profile details (Name, Phone, Avatar) and Password.
 * Includes "dirty state" detection to warn before discarding unsaved changes.
 */
export default function EditUserModal({
  show,
  onClose,
  userId,
  initialFirstName = "",
  initialLastName = "",
  initialPhoneNumber = "",
  initialImage = "",
  onSaved,
}) {
  const initialSnapshotRef = useRef(null);

  // --- Form State ---
  const [firstName, setFirstName] = useState(initialFirstName);
  const [lastName, setLastName] = useState(initialLastName);
  const [phoneNumber, setPhoneNumber] = useState(initialPhoneNumber);

  // --- Image State ---
  const [uploadedFile, setUploadedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(initialImage || "");
  const [showImagePreview, setShowImagePreview] = useState(false);

  // --- Password State ---
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  // --- UI State ---
  const [saving, setSaving] = useState(false);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  const [errors, setErrors] = useState({
    firstName: "",
    phoneNumber: "",
    image: "",
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
    general: "",
  });

  // Calculate password complexity requirements
  const passwordStrength = useMemo(() => {
    const pwd = newPassword || "";
    return {
      hasLength: pwd.length >= 8,
      hasUpper: /[A-Z]/.test(pwd),
      hasLower: /[a-z]/.test(pwd),
      hasNumber: /[0-9]/.test(pwd),
    };
  }, [newPassword]);

  // Reset form when modal opens
  useEffect(() => {
    if (!show) return;

    setFirstName(initialFirstName || "");
    setLastName(initialLastName || "");
    setPhoneNumber(initialPhoneNumber || "");
    setUploadedFile(null);
    setImagePreview(initialImage || "");

    setCurrentPassword("");
    setNewPassword("");
    setConfirmNewPassword("");

    setErrors({
      firstName: "",
      phoneNumber: "",
      image: "",
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
      general: "",
    });

    // Capture initial state for "dirty" checking
    initialSnapshotRef.current = {
      firstName: initialFirstName || "",
      lastName: initialLastName || "",
      phoneNumber: initialPhoneNumber || "",
      imagePreview: initialImage || "",
    };
  }, [show, initialFirstName, initialLastName, initialPhoneNumber, initialImage]);

  // Create current snapshot to compare against initial
  const formSnapshot = useMemo(
    () => ({ firstName, lastName, phoneNumber, imagePreview }),
    [firstName, lastName, phoneNumber, imagePreview]
  );

  // Determine if form has unsaved changes
  const isDirty = useMemo(() => {
    const init = initialSnapshotRef.current;
    if (!init) return false;
    const basicDirty = !shallowEqual(init, formSnapshot);
    const pwdDirty = !!(currentPassword || newPassword || confirmNewPassword);
    return basicDirty || pwdDirty;
  }, [formSnapshot, currentPassword, newPassword, confirmNewPassword]);

  // Validate Israeli phone format
  const validatePhone = (value) => {
    const clean = String(value || "").replace(/\D/g, "");
    if (!clean) return "Phone number is required";
    if (clean.length !== 10) return "Number must be exactly 10 digits";
    if (!clean.startsWith("05")) return "Must start with 05";
    return "";
  };

  const clearErr = (key) => {
    if (!errors[key]) return;
    setErrors((p) => ({ ...p, [key]: "" }));
  };

  // Close handlers
  const requestClose = () => {
    if (!isDirty) return onClose?.();
    setShowDiscardConfirm(true);
  };

  const discardAndClose = () => {
    setShowDiscardConfirm(false);
    onClose?.();
  };

  // Image handlers
  const onFileChange = (file) => {
    if (!file) return;

    const { valid, error } = validateProfilePicture(file);
    if (!valid) {
      setErrors((e) => ({ ...e, image: error || "Invalid image" }));
      return;
    }

    setErrors((e) => ({ ...e, image: "" }));
    setUploadedFile(file);

    // Immediate preview
    const reader = new FileReader();
    reader.onload = () => setImagePreview(String(reader.result || ""));
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setUploadedFile(null);
    setImagePreview("");
    setErrors((e) => ({ ...e, image: "" }));
  };

  // Validation before API call
  const validateBeforeSave = () => {
    const next = {
      firstName: "",
      phoneNumber: "",
      image: errors.image || "",
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
      general: "",
    };

    if (!firstName.trim()) next.firstName = "First name is required";
    next.phoneNumber = validatePhone(phoneNumber);

    const wantsPasswordChange = !!(currentPassword || newPassword || confirmNewPassword);
    if (wantsPasswordChange) {
      if (!currentPassword) next.currentPassword = "Current password is required";
      if (!newPassword) next.newPassword = "New password is required";
      if (!confirmNewPassword) next.confirmNewPassword = "Please confirm the new password";

      if (currentPassword && newPassword && currentPassword === newPassword) {
        next.newPassword = "New password cannot be the same as current password";
      }

      if (newPassword && confirmNewPassword && newPassword !== confirmNewPassword) {
        next.confirmNewPassword = "Passwords don't match";
      }
    }

    setErrors(next);
    return Object.values(next).some(Boolean);
  };

  // Helper UI component for password rules
  const InfoRow = ({ ok, text }) => (
    <div className={`d-flex align-items-center gap-2 ${ok ? "text-success" : "text-danger"}`}>
      <span style={{ width: 18, textAlign: "center" }}>{ok ? "✓" : "•"}</span>
      <span style={{ fontSize: 13 }}>{text}</span>
    </div>
  );

  const handleSave = async () => {
    if (validateBeforeSave()) return;

    try {
      setSaving(true);

      // 1. Prepare Image
      let finalImage = imagePreview;
      if (uploadedFile) {
        finalImage = await getProfilePicture(uploadedFile, firstName.trim(), lastName.trim());
      }

      // 2. Update Profile
      const patch = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phoneNumber: phoneNumber.trim(),
        image: finalImage || "",
      };

      const updatedUser = await updateUserProfile(userId, patch);

      // Notify the application globally that the user (and potentially avatar) has changed
      window.dispatchEvent(
        new CustomEvent("user-updated", { detail: { userId, user: updatedUser } })
      );

      // 3. Update Password (if requested)
      const wantsPasswordChange = !!(currentPassword || newPassword || confirmNewPassword);
      if (wantsPasswordChange) {
        try {
          await changeUserPassword(userId, currentPassword, newPassword);
        } catch (e) {
          const msg = e?.message || "Failed to change password";
          if (String(msg).toLowerCase().includes("current password")) {
            setErrors((p) => ({ ...p, currentPassword: msg }));
          } else {
            setErrors((p) => ({ ...p, general: msg }));
          }
          return; // Do not close modal if password fails
        }
      }

      // Update snapshot to match new saved state
      initialSnapshotRef.current = {
        firstName: patch.firstName,
        lastName: patch.lastName,
        phoneNumber: patch.phoneNumber,
        imagePreview: patch.image,
      };

      onSaved?.(updatedUser);
      onClose?.();

    } catch (e) {
      setErrors((p) => ({ ...p, general: e?.message || "Failed to update profile" }));
    } finally {
      setSaving(false);
    }
  };

  if (!show) return null;

  return (
    <>
      {/* Main Edit Modal */}
      <div
        className="modal d-block"
        tabIndex="-1"
        role="dialog"
        style={{ backgroundColor: "rgba(0,0,0,0.35)", zIndex: 1200 }}
        onClick={requestClose}
      >
        <div className="modal-dialog modal-lg modal-dialog-centered" role="document" onClick={(e) => e.stopPropagation()}>
          <div className="modal-content shadow" style={{ borderRadius: 12 }}>
            <div className="modal-header">
              <h5 className="modal-title">Edit user</h5>
              <button type="button" className="btn-close" aria-label="Close" onClick={requestClose} />
            </div>

            <div className="modal-body">
              {errors.general && <div className="alert alert-danger">{errors.general}</div>}

              <div className="row g-4">
                {/* Left Column: Avatar */}
                <div className="col-12 col-md-4">
                  <div className="d-flex flex-column align-items-center">
                    <div
                      className="rounded-circle border overflow-hidden"
                      style={{
                        width: 120,
                        height: 120,
                        background: "#f5f5f5",
                        cursor: imagePreview ? "pointer" : "default",
                      }}
                      onClick={() => imagePreview && setShowImagePreview(true)}
                    >
                      {imagePreview ? (
                        <img
                          src={imagePreview}
                          alt="Profile"
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      ) : (
                        <div className="w-100 h-100 d-flex align-items-center justify-content-center text-muted">
                          No image
                        </div>
                      )}
                    </div>

                    <div className="mt-3 d-flex gap-2">
                      <label className="btn btn-outline-primary btn-sm mb-0">
                        Upload
                        <input
                          type="file"
                          accept="image/*"
                          hidden
                          onChange={(e) => onFileChange(e.target.files?.[0] || null)}
                        />
                      </label>

                      <button type="button" className="btn btn-outline-secondary btn-sm" onClick={removeImage}>
                        Remove
                      </button>
                    </div>

                    {errors.image && <div className="text-danger mt-2" style={{ fontSize: 13 }}>{errors.image}</div>}
                  </div>
                </div>

                {/* Right Column: Fields */}
                <div className="col-12 col-md-8">
                  <div className="row g-3">
                    <div className="col-12 col-md-6">
                      <label className="form-label">First name</label>
                      <input
                        className={`form-control ${errors.firstName ? "is-invalid" : ""}`}
                        value={firstName}
                        onChange={(e) => { setFirstName(e.target.value); clearErr("firstName"); }}
                      />
                      {errors.firstName && <div className="invalid-feedback">{errors.firstName}</div>}
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label">Last name</label>
                      <input className="form-control" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label">Phone</label>
                      <input
                        className={`form-control ${errors.phoneNumber ? "is-invalid" : ""}`}
                        value={phoneNumber}
                        onChange={(e) => { setPhoneNumber(e.target.value); clearErr("phoneNumber"); }}
                        placeholder="05X-XXX-XXXX"
                      />
                      {errors.phoneNumber ? (
                        <div className="invalid-feedback">{errors.phoneNumber}</div>
                      ) : (
                        <div className="form-text small text-secondary">
                          Israeli mobile numbers only
                        </div>
                      )}
                    </div>
                  </div>

                  <hr className="my-4" />

                  <h6 className="mb-3">Change password</h6>

                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label">Current password</label>
                      <input
                        type="password"
                        className={`form-control ${errors.currentPassword ? "is-invalid" : ""}`}
                        value={currentPassword}
                        onChange={(e) => { setCurrentPassword(e.target.value); clearErr("currentPassword"); }}
                        autoComplete="current-password"
                      />
                      {errors.currentPassword && <div className="invalid-feedback">{errors.currentPassword}</div>}
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label">New password</label>
                      <input
                        type="password"
                        className={`form-control ${errors.newPassword ? "is-invalid" : ""}`}
                        value={newPassword}
                        onChange={(e) => { setNewPassword(e.target.value); clearErr("newPassword"); }}
                        autoComplete="new-password"
                      />
                      {errors.newPassword && <div className="invalid-feedback">{errors.newPassword}</div>}

                      {newPassword && (
                        <div className="mt-2 p-3 bg-white bg-opacity-75 rounded-3 border text-dark">
                          <InfoRow ok={passwordStrength.hasLength} text="At least 8 characters" />
                          <InfoRow ok={passwordStrength.hasUpper} text="One uppercase letter (A-Z)" />
                          <InfoRow ok={passwordStrength.hasLower} text="One lowercase letter (a-z)" />
                          <InfoRow ok={passwordStrength.hasNumber} text="One number (0-9)" />
                        </div>
                      )}
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label">Confirm new password</label>
                      <input
                        type="password"
                        className={`form-control ${errors.confirmNewPassword ? "is-invalid" : ""}`}
                        value={confirmNewPassword}
                        onChange={(e) => { setConfirmNewPassword(e.target.value); clearErr("confirmNewPassword"); }}
                        autoComplete="new-password"
                      />
                      {errors.confirmNewPassword && <div className="invalid-feedback">{errors.confirmNewPassword}</div>}
                    </div>

                    <small className="text-muted">Leave password fields empty if you don't want to change it.</small>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-light" onClick={requestClose} disabled={saving}>
                Cancel
              </button>
              <button type="button" className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Discard Confirmation Modal */}
      {showDiscardConfirm && (
        <div
          className="modal d-block"
          tabIndex="-1"
          role="dialog"
          style={{ backgroundColor: "rgba(0,0,0,0.45)", zIndex: 1300 }}
          onClick={() => setShowDiscardConfirm(false)}
        >
          <div className="modal-dialog modal-dialog-centered" role="document" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content shadow" style={{ borderRadius: 12 }}>
              <div className="modal-header">
                <h6 className="modal-title">Discard changes?</h6>
                <button type="button" className="btn-close" aria-label="Close" onClick={() => setShowDiscardConfirm(false)} />
              </div>
              <div className="modal-body">You have unsaved changes. If you close now, they will be lost.</div>
              <div className="modal-footer">
                <button className="btn btn-light" onClick={() => setShowDiscardConfirm(false)}>Keep editing</button>
                <button className="btn btn-danger" onClick={discardAndClose}>Discard</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Preview Lightbox */}
      {showImagePreview && imagePreview && (
        <div
          className="modal d-block"
          tabIndex="-1"
          role="dialog"
          style={{ backgroundColor: "rgba(0,0,0,0.85)", zIndex: 1400 }}
          onClick={() => setShowImagePreview(false)}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="position-relative">
              <button
                type="button"
                className="btn-close btn-close-white position-absolute top-0 end-0 m-3"
                onClick={() => setShowImagePreview(false)}
                style={{ zIndex: 1 }}
              />
              <img
                src={imagePreview}
                alt="Profile preview"
                style={{ width: "100%", maxHeight: "90vh", objectFit: "contain" }}
                onClick={() => setShowImagePreview(false)}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}