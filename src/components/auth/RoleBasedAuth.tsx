import {useState, useEffect, useRef} from "react";
import {motion} from "framer-motion";
import {gsap} from "gsap";
import {useSearchParams} from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {UserPlus, LogIn, Stethoscope, User, Heart} from "lucide-react";
import {useRoleAuth} from "@/hooks/useRoleAuth";
import {UserRole} from "@/types/roles";

const RoleBasedAuth = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [role, setRole] = useState<UserRole>("user");
  const [doctorId, setDoctorId] = useState("");
  const [loading, setLoading] = useState(false);
  const [rememberEmail, setRememberEmail] = useState(false);
  const [activeTab, setActiveTab] = useState(
    searchParams.get("tab") === "signup" ? "signup" : "signin"
  );

  // Load remembered email from localStorage
  useEffect(() => {
    const rememberedEmail = localStorage.getItem("rememberedEmail");
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberEmail(true);
    }
  }, []);

  // Save email when remember is checked
  useEffect(() => {
    if (rememberEmail && email) {
      localStorage.setItem("rememberedEmail", email);
    } else if (!rememberEmail) {
      localStorage.removeItem("rememberedEmail");
    }
  }, [rememberEmail, email]);

  const {signUp, signIn, doctorSignIn} = useRoleAuth();

  const bubblesRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);

  // Animate bubbles
  useEffect(() => {
    if (bubblesRef.current) {
      const bubbles = bubblesRef.current.querySelectorAll(".bubble");

      bubbles.forEach((bubble) => {
        gsap.to(bubble, {
          x: () => gsap.utils.random(-150, 150),
          y: () => gsap.utils.random(-150, 150),
          duration: () => gsap.utils.random(6, 12),
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: gsap.utils.random(0, 3),
        });
      });
    }
  }, []);

  // Animate slider under active tab
  useEffect(() => {
    if (sliderRef.current) {
      const index = ["signin", "signup", "doctor"].indexOf(activeTab);
      gsap.to(sliderRef.current, {
        xPercent: index * 100,
        duration: 0.4,
        ease: "power2.out",
      });
    }
  }, [activeTab]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    await signUp(email, password, role, {
      username,
      first_name: firstName,
      last_name: lastName,
    });

    setLoading(false);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await signIn(email, password);
      if (!result.error) {
        console.log("Sign in successful");
      }
    } catch (error) {
      console.error("Sign in failed:", error);
    }

    setLoading(false);
  };

  const handleDoctorSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await doctorSignIn(doctorId, password);
      if (!result.error) {
        console.log("Doctor sign in successful");
      }
    } catch (error) {
      console.error("Doctor sign in failed:", error);
    }

    setLoading(false);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Bubbles */}
      <div ref={bubblesRef} className="absolute inset-0 -z-10">
        {Array.from({length: 15}).map((_, i) => (
          <div
            key={i}
            className="bubble absolute rounded-full blur-3xl"
            style={{
              width: `${100 + Math.random() * 150}px`,
              height: `${100 + Math.random() * 150}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              background: `radial-gradient(circle, rgba(99,102,241,0.6), transparent 70%)`,
            }}
          />
        ))}
      </div>

      {/* Auth Card */}
      <motion.div
        initial={{opacity: 0, y: 20}}
        animate={{opacity: 1, y: 0}}
        transition={{duration: 0.5}}
        className="w-full max-w-md z-10"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{scale: 0}}
            animate={{scale: 1}}
            transition={{delay: 0.2, type: "spring", stiffness: 200}}
          >
            <Heart className="size-12 mx-auto text-primary mb-4" />
          </motion.div>
          <h1 className="text-3xl font-heading font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Auricare Platform
          </h1>
          <p className="text-muted-foreground mt-2">
            Secure access for patients, users, and doctors
          </p>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          {/* Slider Tabs */}
          <div className="relative bg-white/70 backdrop-blur-sm rounded-lg overflow-hidden">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
              <TabsTrigger value="doctor">Doctor</TabsTrigger>
            </TabsList>
            {/* Animated slider bar */}
            <div
              ref={sliderRef}
              className="absolute bottom-0 left-0 h-1 w-1/3 bg-gradient-to-r from-blue-600 to-purple-600"
            />
          </div>

          {/* Sign In */}
          <TabsContent value="signin">
            <Card className="bg-white/80 backdrop-blur-lg border-0 shadow-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LogIn className="size-5" /> Sign In
                </CardTitle>
                <CardDescription>
                  Access your Auricare dashboard
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSignIn} className="space-y-5">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Email</Label>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="mt-1"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Password</Label>
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="mt-1"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="rememberEmail"
                      checked={rememberEmail}
                      onChange={(e) => setRememberEmail(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <Label htmlFor="rememberEmail" className="text-sm font-normal cursor-pointer">
                      Remember email
                    </Label>
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                    disabled={loading}
                  >
                    {loading ? "Signing In..." : "Sign In"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sign Up */}
          <TabsContent value="signup">
            <Card className="bg-white/80 backdrop-blur-lg border-0 shadow-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="size-5" /> Create Account
                </CardTitle>
                <CardDescription>Join as a user or patient</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSignUp} className="space-y-5">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Role</Label>
                    <Select
                      value={role}
                      onValueChange={(value: UserRole) => setRole(value)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">
                          <User className="size-4" /> User
                        </SelectItem>
                        <SelectItem value="patient">
                          <Heart className="size-4" /> Patient
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">First Name</Label>
                      <Input
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                        className="mt-1"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Last Name</Label>
                      <Input
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Username</Label>
                    <Input
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      className="mt-1"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Email</Label>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="mt-1"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Password</Label>
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="mt-1"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                    disabled={loading}
                  >
                    {loading ? "Creating..." : "Create Account"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Doctor Login */}
          <TabsContent value="doctor">
            <Card className="bg-white/80 backdrop-blur-lg border-0 shadow-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Stethoscope className="size-5" /> Doctor Login
                </CardTitle>
                <CardDescription>
                  Access with your unique doctor credentials
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleDoctorSignIn} className="space-y-4">
                  <Label>Doctor ID</Label>
                  <Input
                    value={doctorId}
                    onChange={(e) => setDoctorId(e.target.value)}
                    placeholder="DOC001"
                    required
                  />
                  <Label>Password</Label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                    disabled={loading}
                  >
                    {loading ? "Signing In..." : "Doctor Sign In"}
                  </Button>
                </form>
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs text-blue-600">
                    Demo: DOC001/doctor123, DOC002/doctor456, DOC003/doctor789
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
};

export default RoleBasedAuth;
