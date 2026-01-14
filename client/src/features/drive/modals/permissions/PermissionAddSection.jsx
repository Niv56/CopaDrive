import React, { useMemo, useState } from "react";
import { addPermission, findUserByEmail } from "../../api/permissionsApi";
import { getCurrentUser } from "../../api/filesApi";

const BASE_URL = "http://localhost:3000";

export default function PermissionAddSection({ fileId, isOwner, onChanged }) {
    const [email, setEmail] = useState("");
    const [foundUser, setFoundUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const displayName = useMemo(() => {
        if (!foundUser) return "";
        const full = `${foundUser.firstName || ""} ${foundUser.lastName || ""}`.trim();
        return full || foundUser.email?.split("@")[0] || "";
    }, [foundUser]);

    const avatarUrl = useMemo(() => {
        if (!foundUser?.image) return "";
        const raw = foundUser.image;
        return raw.startsWith("data:") || raw.startsWith("http") ? raw : `${BASE_URL}${raw}`;
    }, [foundUser]);

    async function onSearch(e) {
        e?.preventDefault?.();
        if (!isOwner || !email.trim()) return;
        setError("");
        setFoundUser(null);
        setLoading(true);
        try {
            const user = await findUserByEmail(email.trim());
            if (!user) throw new Error("User not found");
            setFoundUser(user);
        } catch (err) {
            setError("User not found. Please check the email address.");
        } finally { setLoading(false); }
    }

    async function onShare() {
        try {
            setLoading(true);
            await addPermission(fileId, foundUser.id);
            setEmail("");
            setFoundUser(null);
            onChanged?.();
        } catch (err) {
            setError("Unable to share file.");
        } finally { setLoading(false); }
    }

    return (
        <div className="mb-4">
            <div className="perm-section-title">Add people</div>
            <form onSubmit={onSearch} className="d-flex gap-2">
                <input 
                    className="perm-add-input w-100" 
                    placeholder="Enter email address..." 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                />
                <button className="perm-search-submit" type="submit" disabled={loading || !email.trim()}>
                    {loading ? '...' : 'Search'}
                </button>
            </form>

            {foundUser && (
                <div className="perm-profile-row mt-3">
                    <div className="perm-profile-left">
                        <div className="perm-avatar">
                            {avatarUrl ? <img className="perm-avatar-img" src={avatarUrl} alt="av" /> : displayName[0]?.toUpperCase()}
                        </div>
                        <div className="perm-profile-text">
                            <div className="perm-profile-name">{displayName}</div>
                            <div className="perm-profile-email">{foundUser.email}</div>
                        </div>
                    </div>
                    <button className="perm-role-toggle-btn" style={{borderColor: '#34a853', color: '#34a853'}} onClick={onShare}>
                        Share
                    </button>
                </div>
            )}
            {error && <div className="text-danger small mt-2 opacity-75">{error}</div>}
        </div>
    );
}