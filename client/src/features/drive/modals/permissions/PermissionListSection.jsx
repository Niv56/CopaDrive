import { 
    getPermissions, 
    deletePermission, 
    togglePermissionRole 
} from "../../api/permissionsApi";
import { getCurrentUser } from "../../api/filesApi";

export default function PermissionListSection({ fileId, isOwner, myUserId, ownerId, refreshTrigger }) {
    const [loading, setLoading] = useState(true);
    const [permissions, setPermissions] = useState([]);
    const [myRole, setMyRole] = useState(null);

    async function load() {
        try {
            setLoading(true);
            const data = await getPermissions(fileId);
            
            // שליפת נתונים מועשרים (שמות ותמונות) עבור כל הרשאה
            const enriched = await Promise.all(data.permissions.map(async (perm) => {
                try {
                    const user = await getUserById(perm.userId);
                    return { ...perm, ...user };
                } catch { return perm; }
            }));

            setPermissions(enriched);
            if (data.myRole) setMyRole(data.myRole);
        } catch (e) {
            console.error("Failed to load permissions");
        } finally { setLoading(false); }
    }

    useEffect(() => { load(); }, [fileId, refreshTrigger]);

    const handleDelete = async (p) => {
        await deletePermission(fileId, p.id);
        load();
    };

    const handleToggle = async (p) => {
        await togglePermissionRole(fileId, p.id);
        load();
    };

    return (
        <div>
            <div className="perm-section-title mb-3">Who has access</div>
            {myRole && <div className="alert alert-info p-2 small">Your role: {myRole}</div>}
            <div className="d-flex flex-column gap-2">
                {permissions.map(p => (
                    <PermissionRow 
                        key={p.id} 
                        permission={p} 
                        canManage={isOwner} 
                        onDelete={handleDelete}
                        onToggle={handleToggle}
                    />
                ))}
            </div>
        </div>
    );
}