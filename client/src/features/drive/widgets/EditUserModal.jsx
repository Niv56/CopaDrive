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
          return;
        }
      }

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
      {/* ✅ CSS מעודכן: תיבות מעוגלות, רקע אפור ברור (contrast), ופוקוס יפה */}
      <style>{`
        .edit-user-input {
          background-color: #f1f3f4 !important; /* רקע אפור בולט יותר */
          border: 1px solid transparent !important;
          border-radius: 50px !important; /* מעוגל כמו החיפוש */
          padding: 10px 20px !important; /* ריווח פנימי נוח */
          color: #202124 !important;
          transition: all 0.2s ease-in-out !important;
        }
        
        .edit-user-input:focus {
          background-color: #ffffff !important;
          border-color: transparent !important;
          box-shadow: 0 1px 6px rgba(32,33,36,0.28) !important; /* צללית יפה בפוקוס */
          color: #202124 !important;
        }

        /* התאמה למצב לילה - שיהיה קריא גם שם */
        [data-theme="dark"] .edit-user-input {
          background-color: #303134 !important;
          color: #e8eaed !important;
        }
        [data-theme="dark"] .edit-user-input:focus {
          background-color: #3c4043 !important;
          box-shadow: 0 1px 6px rgba(0,0,0,0.5) !important;
        }
      `}</style>

      {/* Main Edit Modal */}
      <div
        className="modal d-block"
        tabIndex="-1"
        role="dialog"
        style={{ backgroundColor: "rgba(0,0,0,0.35)", zIndex: 1200 }}
        onClick={requestClose}
      >
        <div className="modal-dialog modal-lg modal-dialog-centered" role="document" onClick={(e) => e.stopPropagation()}>
          <div className="modal-content shadow" style={{ borderRadius: 24, border: "none" }}> {/* גם למודל עצמו עיגול יפה יותר */}
            <div className="modal-header border-0 pb-0 pt-4 px-4">
              <h4 className="modal-title fw-bold">Edit user</h4>
              <button type="button" className="btn-close" aria-label="Close" onClick={requestClose} />
            </div>

            <div className="modal-body p-4">
              {errors.general && <div className="alert alert-danger rounded-4">{errors.general}</div>}

              <div className="row g-4">
                {/* Left Column: Avatar */}
                <div className="col-12 col-md-4 border-end">
                  <div className="d-flex flex-column align-items-center h-100 justify-content-center">
                    <div
                      className="rounded-circle overflow-hidden position-relative shadow-sm"
                      style={{
                        width: 140,
                        height: 140,
                        background: "#f1f3f4",
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
                        <div className="w-100 h-100 d-flex align-items-center justify-content-center text-muted display-4">
                          👤
                        </div>
                      )}
                    </div>

                    <div className="mt-4 d-flex flex-column gap-2 w-75">
                      <label className="btn btn-primary rounded-pill w-100">
                        Change photo
                        <input
                          type="file"
                          accept="image/*"
                          hidden
                          onChange={(e) => onFileChange(e.target.files?.[0] || null)}
                        />
                      </label>

                      {imagePreview && (
                        <button type="button" className="btn btn-outline-danger rounded-pill w-100" onClick={removeImage}>
                          Remove
                        </button>
                      )}
                    </div>

                    {errors.image && <div className="text-danger mt-2 small">{errors.image}</div>}
                  </div>
                </div>

                {/* Right Column: Fields */}
                <div className="col-12 col-md-8 ps-md-4">
                  <div className="row g-3">
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-bold small ms-2 text-muted">FIRST NAME</label>
                      <input
                        className={`form-control edit-user-input ${errors.firstName ? "is-invalid" : ""}`}
                        value={firstName}
                        onChange={(e) => { setFirstName(e.target.value); clearErr("firstName"); }}
                        placeholder="Enter first name"
                      />
                      {errors.firstName && <div className="invalid-feedback ms-2">{errors.firstName}</div>}
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label fw-bold small ms-2 text-muted">LAST NAME</label>
                      <input 
                        className="form-control edit-user-input" 
                        value={lastName} 
                        onChange={(e) => setLastName(e.target.value)} 
                        placeholder="Enter last name"
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label fw-bold small ms-2 text-muted">PHONE NUMBER</label>
                      <input
                        className={`form-control edit-user-input ${errors.phoneNumber ? "is-invalid" : ""}`}
                        value={phoneNumber}
                        onChange={(e) => { setPhoneNumber(e.target.value); clearErr("phoneNumber"); }}
                        placeholder="05X-XXX-XXXX"
                      />
                      {errors.phoneNumber && <div className="invalid-feedback ms-2">{errors.phoneNumber}</div>}
                    </div>
                  </div>

                  <div className="my-4 border-top"></div>

                  <h6 className="mb-3 fw-bold">Change Password</h6>

                  <div className="row g-3">
                    <div className="col-12">
                      <input
                        type="password"
                        className={`form-control edit-user-input ${errors.currentPassword ? "is-invalid" : ""}`}
                        value={currentPassword}
                        onChange={(e) => { setCurrentPassword(e.target.value); clearErr("currentPassword"); }}
                        placeholder="Current password"
                        autoComplete="current-password"
                      />
                      {errors.currentPassword && <div className="invalid-feedback ms-2">{errors.currentPassword}</div>}
                    </div>

                    <div className="col-12 col-md-6">
                      <input
                        type="password"
                        className={`form-control edit-user-input ${errors.newPassword ? "is-invalid" : ""}`}
                        value={newPassword}
                        onChange={(e) => { setNewPassword(e.target.value); clearErr("newPassword"); }}
                        placeholder="New password"
                        autoComplete="new-password"
                      />
                      {errors.newPassword && <div className="invalid-feedback ms-2">{errors.newPassword}</div>}
                    </div>

                    <div className="col-12 col-md-6">
                      <input
                        type="password"
                        className={`form-control edit-user-input ${errors.confirmNewPassword ? "is-invalid" : ""}`}
                        value={confirmNewPassword}
                        onChange={(e) => { setConfirmNewPassword(e.target.value); clearErr("confirmNewPassword"); }}
                        placeholder="Confirm new password"
                        autoComplete="new-password"
                      />
                      {errors.confirmNewPassword && <div className="invalid-feedback ms-2">{errors.confirmNewPassword}</div>}
                    </div>

                    {newPassword && (
                      <div className="mt-2 p-3 bg-light rounded-4 border">
                        <InfoRow ok={passwordStrength.hasLength} text="At least 8 characters" />
                        <InfoRow ok={passwordStrength.hasUpper} text="One uppercase letter" />
                        <InfoRow ok={passwordStrength.hasLower} text="One lowercase letter" />
                        <InfoRow ok={passwordStrength.hasNumber} text="One number" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer border-0 pt-0 pb-4 px-4">
              <button type="button" className="btn btn-light rounded-pill px-4" onClick={requestClose} disabled={saving}>
                Cancel
              </button>
              <button type="button" className="btn btn-primary rounded-pill px-4" onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save changes"}
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
            <div className="modal-content shadow rounded-4">
              <div className="modal-header border-0">
                <h5 className="modal-title fw-bold">Unsaved changes</h5>
                <button type="button" className="btn-close" aria-label="Close" onClick={() => setShowDiscardConfirm(false)} />
              </div>
              <div className="modal-body">Are you sure you want to discard your changes?</div>
              <div className="modal-footer border-0">
                <button className="btn btn-light rounded-pill" onClick={() => setShowDiscardConfirm(false)}>Keep editing</button>
                <button className="btn btn-danger rounded-pill" onClick={discardAndClose}>Discard</button>
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
          style={{ backgroundColor: "rgba(0,0,0,0.9)", zIndex: 1400 }}
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
                style={{ width: "100%", maxHeight: "80vh", objectFit: "contain" }}
                onClick={() => setShowImagePreview(false)}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}