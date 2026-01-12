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
            if (!basic?.id) throw new Error("User not found");
            const full = await getCurrentUser(basic.id);
            setFoundUser({ ...basic, ...full });
        } catch (err) {
            setError(err.message || "Search failed");
        } finally {
            setLoading(false);
        }
    }

    async function onShare() {
        if (!isOwner || !foundUser?.id) return;
        setLoading(true);
        try {
            await addPermission(fileId, foundUser.id);
            setEmail("");
            setFoundUser(null);
            onChanged?.();
        } catch (err) {
            setError(err.message || "Share failed");
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

            {error && <div className="perm-error mt-2">{error}</div>}
        </div>
    );
}