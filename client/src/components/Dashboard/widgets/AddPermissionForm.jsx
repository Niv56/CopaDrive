import React, { useState } from "react";

function AddPermissionForm({ isOwner, onSearch, onShare }) {
    const [email, setEmail] = useState("");
    const [foundUser, setFoundUser] = useState(null);
    const [status, setStatus] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSearch = async (e) => {
        e?.preventDefault?.();
        setStatus("");
        setFoundUser(null);

        if (!email.trim()) return;

        setLoading(true);
        try {
            const user = await onSearch(email.trim());
            setFoundUser(user || null);
            if (!user) setStatus("User not found");
        } catch (err) {
            setFoundUser(null);
            setStatus(err?.message || "User not found");
        } finally {
            setLoading(false);
        }
    };

    const handleShare = async () => {
        if (!foundUser?.id) return;

        setLoading(true);
        setStatus("");
        try {
            await onShare(foundUser.id);
            setStatus("Shared ✓");
            setFoundUser(null);
            setEmail("");
        } catch (err) {
            // אם כבר קיים – לא נשרוף UI
            const msg = err?.message || "Failed to share";
            if (msg.toLowerCase().includes("already")) {
                setStatus("Already shared ✓");
            } else {
                setStatus(msg);
            }
        } finally {
            setLoading(false);
        }
    };

    if (!isOwner) {
        return (
            <div className="share-warning">
                <span className="share-warning-icon">⚠</span>
                <span>Only the owner can manage permissions for this item.</span>
            </div>
        );
    }

    return (
        <form onSubmit={handleSearch} className="share-add">
            <div className="share-add-row">
                <input
                    className="modal-input share-add-input"
                    placeholder="Enter email address..."
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                />

                <button
                    type="submit"
                    className="btn share-btn-outline rounded-pill px-4"
                    disabled={loading || !email.trim()}
                >
                    {loading ? "..." : "Search"}
                </button>
            </div>

            {foundUser ? (
                <div className="share-found">
                    <div className="share-muted small">
                        Found: <b>{foundUser.email}</b>
                    </div>
                    <button
                        type="button"
                        className="btn share-btn-primary rounded-pill px-4"
                        onClick={handleShare}
                        disabled={loading}
                    >
                        Share
                    </button>
                </div>
            ) : null}

            {status ? <div className="share-status">{status}</div> : null}
        </form>
    );
}

export default AddPermissionForm;
