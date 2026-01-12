// client/src/components/Dashboard/widgets/AddPermissionForm.jsx
import React, { useMemo, useState } from "react";

/**
 * AddPermissionForm - Top section (POST)
 * Allows OWNER to add new permissions
 * Shows warning message for non-owners
 */
function AddPermissionForm({ isOwner, onSearch, onShare }) {
    const [email, setEmail] = useState("");
    const [foundUser, setFoundUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const initials = useMemo(() => {
        const e = (foundUser?.email || "").trim();
        if (!e) return "";
        return e.charAt(0).toUpperCase();
    }, [foundUser?.email]);

    // If not Owner - show message
    if (!isOwner) {
        return (
            <div
                className="alert alert-warning py-2 px-3 d-flex align-items-center gap-2"
                style={{ fontSize: "14px", borderRadius: "10px", marginBottom: 0 }}
            >
                <span>⚠️</span>
                <span>Only the owner can manage permissions for this item.</span>
            </div>
        );
    }

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!email.trim()) return;

        setLoading(true);
        setErrorMsg("");
        setFoundUser(null);

        try {
            const user = await onSearch(email.trim());
            if (user) {
                setFoundUser(user);
            } else {
                setErrorMsg("User not found");
            }
        } catch (err) {
            setErrorMsg(err.message || "Search failed");
        } finally {
            setLoading(false);
        }
    };

    const handleShare = async () => {
        if (!foundUser) return;

        try {
            await onShare(foundUser.id);
            setFoundUser(null);
            setEmail("");
            setErrorMsg("");
        } catch (err) {
            setErrorMsg(err.message || "Failed to share");
        }
    };

    return (
        <div className="mb-3">
            <label className="form-label small fw-semibold mb-2">Add people</label>

            <form onSubmit={handleSearch} className="d-flex gap-2">
                <input
                    className="form-control rounded-pill modal-input"
                    placeholder="Enter email address..."
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                />
                <button
                    type="submit"
                    className="btn share-btn-neutral rounded-pill px-4"
                    disabled={loading || !email.trim()}
                >
                    {loading ? "..." : "Search"}
                </button>
            </form>

            {errorMsg && (
                <div className="alert alert-danger py-1 px-2 mt-2 small">
                    {errorMsg}
                </div>
            )}

            {foundUser && (
                <div
                    className="mt-2 p-2 border rounded-3 d-flex justify-content-between align-items-center"
                    style={{ background: "#f9fafb", borderColor: "#e5e7eb" }}
                >
                    <div className="d-flex align-items-center gap-2">
                        {/* Avatar: show image if exists, otherwise initials (no fixed blue background) */}
                        <div className="share-avatar">
                            {foundUser.image ? (
                                <img src={foundUser.image} alt="user" />
                            ) : (
                                <span className="share-avatar-initials">{initials}</span>
                            )}
                        </div>

                        <div className="d-flex flex-column">
                            <span className="small fw-bold">{foundUser.email}</span>
                            <span className="small share-muted">Ready to add</span>
                        </div>
                    </div>

                    <button
                        className="btn share-btn-outline btn-sm rounded-pill px-3"
                        onClick={handleShare}
                        type="button"
                    >
                        Add
                    </button>
                </div>
            )}
        </div>
    );
}

export default AddPermissionForm;
