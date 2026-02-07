import { useNavigate } from "react-router";
import Logo3D from "@/react-app/components/Logo3D";
import { Button } from "@/react-app/components/ui/button";
import { Card } from "@/react-app/components/ui/card";

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6">
      <div className="w-full max-w-3xl">
        <div className="flex flex-col items-center text-center gap-4 mb-10">
          <Logo3D />
          <h1 className="text-4xl font-extrabold text-slate-900">COGZ</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Sign in</h2>
            <p className="text-sm text-slate-600 mb-6">Login with username and password</p>
            <Button className="w-full" onClick={() => navigate("/login")}>
              Continue
            </Button>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Guest mode</h2>
            <p className="text-sm text-slate-600 mb-6">Enter without login</p>
            <Button variant="outline" className="w-full" onClick={() => navigate("/analyze")}>
              Continue
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
