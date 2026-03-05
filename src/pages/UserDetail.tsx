import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/PageHeader";

const UserDetail = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <PageHeader title="User Details" description={`Viewing details for user ID: ${id}`} />
            </div>

            <div className="rounded-xl border bg-card p-8 text-center text-muted-foreground shadow-sm">
                <p>User details implementation goes here.</p>
                <p className="text-sm mt-2">ID: {id}</p>
            </div>
        </div>
    );
};

export default UserDetail;
