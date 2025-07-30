import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { AuthProvider } from "./pages/context.jsx";
import { MovieProvider } from "./components/Searchbar";
import { MyListingsProvider } from "./MyListingsContext.jsx";
import { CreateEventProvider } from "./CreateEventContext.jsx";
import { GoogleOAuthProvider } from "@react-oauth/google";
// import { GoogleLogin } from "@react-oauth/google";
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <GoogleOAuthProvider clientId="806279261028-mmoc8fdjpfnr89tqe0quiac9v4nporrc.apps.googleusercontent.com">
      <AuthProvider>
        <MovieProvider>
          <CreateEventProvider>
            <MyListingsProvider>
              <App />
            </MyListingsProvider>
          </CreateEventProvider>
        </MovieProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  </StrictMode>
);
