import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SignedIn, SignedOut, RedirectToSignIn, UserButton, useUser } from "@clerk/clerk-react";

export const Login = () => {
  const navigate = useNavigate();
  const { isSignedIn } = useUser(); // Get current sign-in status

  // Redirect if already signed in
  useEffect(() => {
    if (isSignedIn) {
      navigate("/Main");
    }
  }, [isSignedIn, navigate]);

  return (
    <div>
      {/* Show SignIn/SignUp only if signed out */}
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>

      {/* Optional: Show header if signed in briefly before redirect */}
      <SignedIn>
        <header className="flex justify-end p-4 border-b">
          <UserButton afterSignOutUrl="/" />
        </header>
        <main className="p-4">
          <p>Redirecting to Main page...</p>
        </main>
      </SignedIn>
    </div>
  );
};
