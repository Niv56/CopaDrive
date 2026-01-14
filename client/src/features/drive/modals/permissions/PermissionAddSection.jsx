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
            setError("Unable to share file. User might already have access.");
        } finally { setLoading(false); }
    }

    return (
        <div className="mb-4">
            <div className="perm-section-title mb-2">Share with people</div>
            <form onSubmit={onSearch} className="d-flex gap-2">
                <input 
                    className="form-control" 
                    placeholder="Enter user email..." 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                />
                <button className="btn btn-primary" type="submit" disabled={loading}>Search</button>
            </form>
            {foundUser && (
                <div className="perm-profile-row mt-3 d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center gap-2">
                        <div className="perm-avatar">{avatarUrl ? <img src={avatarUrl} alt="av" /> : displayName[0]}</div>
                        <div>{displayName}</div>
                    </div>
                    <button className="btn btn-success btn-sm" onClick={onShare}>Share</button>
                </div>
            )}
            {error && <div className="text-danger small mt-2">{error}</div>}
        </div>
    );
}