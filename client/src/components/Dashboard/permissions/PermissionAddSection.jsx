// client/src/components/Dashboard/permissions/PermissionAddSection.jsx
import React, { useMemo, useState } from "react";
import { addPermission, findUserByEmail } from "../../../api/permissionsApi";
import { getCurrentUser } from "../../../api/filesApi";

const BASE_URL = "http://localhost:3000";

export default function PermissionAddSection({ fileId, isOwner, onChanged }) {
    const [email, setEmail] = useState("");
    const [foundUser, setFoundUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const displayName = useMemo(() => {
        if (!foundUser) return "";
        const first = foundUser.firstName || "";
        const last = foundUser.lastName || "";
        const full = `${first} ${last}`.trim();
        return full || (foundUser.email ? foundUser.email.split("@")[0] : "");
    }, [foundUser]);

    const avatarUrl = useMemo(() => {
        if (!foundUser?.image) return "";
        const raw = foundUser.image;
        return raw.startsWith("data:") || raw.startsWith("http")
            ? raw
            : `${BASE_URL}${raw.startsWith('/') ? '' : '/'}${raw}`;
    }, [foundUser]);

    const avatarInitial = useMemo(() => displayName[0]?.toUpperCase() || "?", [displayName]);

    async function onSearch(e) {
        e?.preventDefault?.();
        if (!isOwner || !email.trim()) return;

        setError("");
        setFoundUser(null);
        setLoading(true);
        try {
            const basic = await findUserByEmail(email.trim());
            if (!basic?.id) {
                setError("User not found. Please check the email address.");
                return;
            }
            const full = await getCurrentUser(basic.id);
            setFoundUser({ ...basic, ...full });
        } catch (err) {
            const errorMessage = err.message || "Search failed";
            if (errorMessage.includes("not found") || errorMessage.includes("404")) {
                setError("User not found. Please check the email address.");
            } else if (errorMessage.includes("network") || errorMessage.includes("fetch")) {
                setError("Connection error. Please check your internet connection.");
            } else {
                setError("Unable to search for user. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    }

    async function onShare() {
        if (!isOwner || !foundUser?.id) return;
        setLoading(true);
        setError("");
        try {
            await addPermission(fileId, foundUser.id);
            setEmail("");
            setFoundUser(null);
            onChanged?.();
        } catch (err) {
            const errorMessage = err.message || "Share failed";
            if (errorMessage.includes("already exists") || errorMessage.includes("409")) {
                setError("This user already has access to this file.");
            } else if (errorMessage.includes("permission") || errorMessage.includes("403")) {
                setError("You don't have permission to share this file.");
            } else {
                setError("Unable to share file. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="mb-4">
            <div className="perm-section-title mb-2">Share with people</div>

            <form onSubmit={onSearch} className="d-flex gap-2">
                <input
                    className="form-control shadow-none"
                    style={{ borderRadius: '10px' }}
                    placeholder={isOwner ? "Enter user email..." : "Only owner can manage sharing"}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={!isOwner || loading}
                />
                {isOwner && (
                    <button
                        className="btn btn-primary px-4"
                        type="submit"
                        disabled={loading || !email.trim()}
                        style={{ borderRadius: '10px' }}
                    >
                        {loading ? "..." : "Search"}
                    </button>
                )}
            </form>

            {foundUser && (
                <div className="perm-profile-row mt-3">
                    <div className="perm-profile-left">
                        <div className="perm-avatar">
                            {avatarUrl ? <img className="perm-avatar-img" src={avatarUrl} alt="av" /> : avatarInitial}
                        </div>
                        <div className="perm-profile-text">
                            <div className="perm-profile-name">{displayName}</div>
                            <div className="perm-profile-email">{foundUser.email}</div>
                        </div>
                    </div>

                    <button className="btn btn-success btn-sm px-3" onClick={onShare} disabled={loading} style={{ borderRadius: '8px' }}>
                        Share
                    </button>
                </div>
            )}

            {error && (
                <div className="perm-error-box mt-3">
                    <svg className="perm-error-icon" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <span>{error}</span>
                </div>
            )}
        </div>
    );
}