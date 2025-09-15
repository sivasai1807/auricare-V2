import {useState, useEffect} from "react";
import {Helmet} from "react-helmet-async";
import {useRoleAuth} from "@/hooks/useRoleAuth";
import {useNavigate} from "react-router-dom";
import {Button} from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {Heart, UserPlus, LogIn} from "lucide-react";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<"signin" | "signup">("signin");

  const {signUp, signIn, user} = useRoleAuth();
  const navigate = useNavigate();

  const canonical =
    typeof window !== "undefined"
      ? window.location.origin + window.location.pathname
      : "";

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await signUp(email, password, "patient", {
        first_name: firstName,
        last_name: lastName,
      });

      setLoading(false);

      if (!res || !res.error) {
        // Switch to Sign In tab so user can sign in after verifying email
        setTab("signin");
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await signIn(email, password);
      setLoading(false);
      // navigation is handled inside useRoleAuth.signIn based on role
      return res;
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <main className="container mx-auto py-20 min-h-screen flex items-center justify-center">
      <Helmet>
        <title>Join AuriCare — Family & Therapist Access</title>
        <meta
          name="description"
          content="Sign up or sign in to access AuriCare's autism support platform with therapy tracking and AI assistance."
        />
        {canonical && <link rel="canonical" href={canonical} />}
      </Helmet>

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Heart className="size-12 mx-auto text-primary mb-4" />
          <h1 className="text-2xl font-heading font-semibold">
            Welcome to AuriCare
          </h1>
          <p className="text-muted-foreground">
            Secure access for families and therapists
          </p>
        </div>

        <Tabs
          value={tab}
          onValueChange={(v) => setTab(v)}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="signin">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LogIn className="size-5" />
                  Sign In
                </CardTitle>
                <CardDescription>
                  Access your AuriCare dashboard
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <Input
                      id="signin-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    variant="glow"
                    className="w-full"
                    disabled={loading}
                  >
                    {loading ? "Signing In..." : "Sign In"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="signup">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="size-5" />
                  Create Account
                </CardTitle>
                <CardDescription>
                  Join AuriCare as a family or therapist
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="first-name">First Name</Label>
                      <Input
                        id="first-name"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="last-name">Last Name</Label>
                      <Input
                        id="last-name"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    variant="glow"
                    size="xl"
                    className="w-full bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-100"
                    disabled={loading}
                  >
                    {loading ? "Creating Account..." : "Create Account"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
};

export default Auth;
