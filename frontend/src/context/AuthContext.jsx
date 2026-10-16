
import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
} from "react";

import API from "../api/client";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(
    () => localStorage.getItem("access_token") || null
  );

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ---------------------------------------------------------
  // JWT AUTHORIZATION HEADER
  // ---------------------------------------------------------

  const setAuthorizationHeader = useCallback((accessToken) => {
    if (accessToken) {
      API.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
    } else {
      delete API.defaults.headers.common.Authorization;
    }
  }, []);

  // ---------------------------------------------------------
  // CLEAR SESSION
  // ---------------------------------------------------------

  const clearAuthentication = useCallback(() => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");

    setAuthorizationHeader(null);
    setToken(null);
    setUser(null);
  }, [setAuthorizationHeader]);

  // ---------------------------------------------------------
  // LOAD CURRENT USER
  // ---------------------------------------------------------

  const loadUser = useCallback(async () => {
    const savedToken = localStorage.getItem("access_token");

    if (!savedToken) {
      setUser(null);
      return null;
    }

    setAuthorizationHeader(savedToken);

    const response = await API.get("user-role/");
    const data = response.data;

    const role = String(data.role || "").toLowerCase();

    const authenticatedUser = {
      id: data.id ?? null,
      username: data.username ?? "",
      email: data.email ?? "",
      role,

      is_staff: Boolean(data.is_staff),
      is_superuser: Boolean(data.is_superuser),

      estate: data.estate ?? null,
      estate_id: data.estate_id ?? null,
      estate_name: data.estate_name ?? null,
      estate_ids: Array.isArray(data.estate_ids)
        ? data.estate_ids
        : [],

      labour_profile_id: data.labour_profile_id ?? null,
      buyer_profile_id: data.buyer_profile_id ?? null,
      is_approved: Boolean(data.is_approved),
    };

    setUser(authenticatedUser);

    return authenticatedUser;
  }, [setAuthorizationHeader]);

  // ---------------------------------------------------------
  // LOGIN
  // ---------------------------------------------------------

  const login = useCallback(
    async (username, password) => {
      if (!username?.trim()) {
        throw new Error("Username is required.");
      }

      if (!password) {
        throw new Error("Password is required.");
      }

      try {
        const response = await API.post("token/", {
          username: username.trim(),
          password,
        });

        const accessToken = response.data?.access;
        const refreshToken = response.data?.refresh;

        if (!accessToken) {
          throw new Error("The server did not return an access token.");
        }

        localStorage.setItem("access_token", accessToken);

        if (refreshToken) {
          localStorage.setItem("refresh_token", refreshToken);
        } else {
          localStorage.removeItem("refresh_token");
        }

        // Set header before making the next API request.
        setAuthorizationHeader(accessToken);
        setToken(accessToken);

        await loadUser();

        return response.data;
      } catch (error) {
        console.error(
          "Login failed:",
          error.response?.data || error.message
        );

        // Clear session only for authentication failures.
        if (error.response?.status === 401) {
          clearAuthentication();
        }

        throw error;
      }
    },
    [clearAuthentication, loadUser, setAuthorizationHeader]
  );

  // ---------------------------------------------------------
  // LOGOUT
  // ---------------------------------------------------------

  const logout = useCallback(() => {
    clearAuthentication();
  }, [clearAuthentication]);

  // ---------------------------------------------------------
  // RESTORE SESSION AFTER REFRESH
  // ---------------------------------------------------------

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      const savedToken = localStorage.getItem("access_token");

      if (!savedToken) {
        setAuthorizationHeader(null);

        if (mounted) {
          setToken(null);
          setUser(null);
          setLoading(false);
        }

        return;
      }

      setAuthorizationHeader(savedToken);

      if (mounted) {
        setToken(savedToken);
      }

      try {
        await loadUser();
      } catch (error) {
        console.error(
          "Unable to restore session:",
          error.response?.data || error.message
        );

        if (mounted) {
          clearAuthentication();
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
    };
  }, [
    clearAuthentication,
    loadUser,
    setAuthorizationHeader,
  ]);

  // ---------------------------------------------------------
  // ROLE HELPERS
  // ---------------------------------------------------------

  const role = user?.role || "";

  const isAdmin = role === "admin";
  const isEstateOwner = role === "estate_owner";
  const isLabour = role === "labour";
  const isBuyer = role === "buyer";

  // ---------------------------------------------------------
  // CONTEXT VALUE
  // ---------------------------------------------------------

  const value = {
    token,
    user,
    loading,

    login,
    logout,
    loadUser,
    clearAuthentication,

    role,
    isAdmin,
    isEstateOwner,
    isLabour,
    isBuyer,

    isAuthenticated: Boolean(token && user),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// -----------------------------------------------------------
// useAuth HOOK
// -----------------------------------------------------------

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside an AuthProvider.");
  }

  return context;
};

export default AuthContext;
























// import React, {
//   createContext,
//   useState,
//   useContext,
//   useEffect,
//   useCallback,
// } from "react";

// import API from "../api/client";

// const AuthContext = createContext(null);

// export const AuthProvider = ({ children }) => {
//   // =========================================================
//   // AUTH STATE
//   // =========================================================

//   const [token, setToken] = useState(
//     () => localStorage.getItem("access_token") || null
//   );

//   const [user, setUser] = useState(null);

//   const [loading, setLoading] = useState(true);

//   // =========================================================
//   // SET / REMOVE AXIOS AUTHORIZATION HEADER
//   // =========================================================

//   const setAuthorizationHeader = useCallback((accessToken) => {
//     if (accessToken) {
//       API.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
//     } else {
//       delete API.defaults.headers.common.Authorization;
//     }
//   }, []);

//   // =========================================================
//   // CLEAR AUTHENTICATION
//   // =========================================================

//   const clearAuthentication = useCallback(() => {
//     localStorage.removeItem("access_token");
//     localStorage.removeItem("refresh_token");

//     setAuthorizationHeader(null);

//     setToken(null);
//     setUser(null);
//   }, [setAuthorizationHeader]);

//   // =========================================================
//   // LOAD CURRENT USER
//   // =========================================================

//   const loadUser = useCallback(async () => {
//     try {
//       const savedToken = localStorage.getItem("access_token");

//       if (!savedToken) {
//         setUser(null);
//         return null;
//       }

//       // Always make sure Axios has the current JWT
//       setAuthorizationHeader(savedToken);

//       const res = await API.get("user-role/");

//       const data = res.data;

//       const authenticatedUser = {
//         id: data.id ?? null,
//         username: data.username ?? "",
//         role: data.role ?? "",

//         is_staff: Boolean(data.is_staff),
//         is_superuser: Boolean(data.is_superuser),

//         estate: data.estate ?? null,
//         estate_id: data.estate_id ?? null,
//         estate_name: data.estate_name ?? null,
//       };

//       setUser(authenticatedUser);

//       return data;
//     } catch (error) {
//       console.error(
//         "Failed to load user:",
//         error.response?.data || error.message
//       );

//       setUser(null);

//       throw error;
//     }
//   }, [setAuthorizationHeader]);

//   // =========================================================
//   // LOGIN
//   // =========================================================

//   const login = useCallback(
//     async (username, password) => {
//       try {
//         // -----------------------------------------------------
//         // Validate login fields
//         // -----------------------------------------------------

//         if (!username || !username.trim()) {
//           throw new Error("Username is required.");
//         }

//         if (!password) {
//           throw new Error("Password is required.");
//         }

//         // -----------------------------------------------------
//         // Login request
//         // -----------------------------------------------------

//         const res = await API.post("token/", {
//           username: username.trim(),
//           password,
//         });

//         // -----------------------------------------------------
//         // Get tokens
//         // -----------------------------------------------------

//         const accessToken = res.data?.access;
//         const refreshToken = res.data?.refresh;

//         if (!accessToken) {
//           throw new Error(
//             "Login failed because the server did not return an access token."
//           );
//         }

//         // -----------------------------------------------------
//         // Store access token
//         // -----------------------------------------------------

//         localStorage.setItem("access_token", accessToken);

//         // -----------------------------------------------------
//         // Store refresh token if provided
//         // -----------------------------------------------------

//         if (refreshToken) {
//           localStorage.setItem("refresh_token", refreshToken);
//         }

//         // -----------------------------------------------------
//         // IMPORTANT
//         //
//         // Attach JWT immediately.
//         //
//         // React state updates are asynchronous, so we cannot
//         // depend on setToken() for the next API request.
//         // -----------------------------------------------------

//         setAuthorizationHeader(accessToken);

//         // -----------------------------------------------------
//         // Update React state
//         // -----------------------------------------------------

//         setToken(accessToken);

//         // -----------------------------------------------------
//         // Load authenticated user
//         // -----------------------------------------------------

//         await loadUser();

//         return res.data;
//       } catch (error) {
//         console.error(
//           "Login failed:",
//           error.response?.data || error.message
//         );

//         // -----------------------------------------------------
//         // Invalid credentials
//         // -----------------------------------------------------

//         if (error.response?.status === 401) {
//           clearAuthentication();
//         }

//         throw error;
//       }
//     },
//     [clearAuthentication, loadUser, setAuthorizationHeader]
//   );

//   // =========================================================
//   // LOGOUT
//   // =========================================================

//   const logout = useCallback(() => {
//     clearAuthentication();
//   }, [clearAuthentication]);

//   // =========================================================
//   // INITIAL AUTHENTICATION CHECK
//   // =========================================================

//   useEffect(() => {
//     let mounted = true;

//     const checkAuthentication = async () => {
//       const savedToken = localStorage.getItem("access_token");

//       // -------------------------------------------------------
//       // No token
//       // -------------------------------------------------------

//       if (!savedToken) {
//         setAuthorizationHeader(null);

//         if (mounted) {
//           setToken(null);
//           setUser(null);
//           setLoading(false);
//         }

//         return;
//       }

//       // -------------------------------------------------------
//       // Token exists
//       // -------------------------------------------------------

//       try {
//         // Restore JWT after browser refresh
//         setAuthorizationHeader(savedToken);

//         if (mounted) {
//           setToken(savedToken);
//         }

//         // Verify the session
//         await loadUser();
//       } catch (error) {
//         console.error(
//           "Existing session is invalid:",
//           error.response?.data || error.message
//         );

//         // Invalid token/session
//         clearAuthentication();
//       } finally {
//         if (mounted) {
//           setLoading(false);
//         }
//       }
//     };

//     checkAuthentication();

//     return () => {
//       mounted = false;
//     };
//   }, [
//     clearAuthentication,
//     loadUser,
//     setAuthorizationHeader,
//   ]);

//   // =========================================================
//   // CONTEXT VALUE
//   // =========================================================

//   const value = {
//     // Authentication
//     token,
//     user,
//     loading,

//     // Authentication methods
//     login,
//     logout,
//     loadUser,

//     // Authentication status
//     isAuthenticated: Boolean(token && user),
//   };

//   // =========================================================
//   // PROVIDER
//   // =========================================================

//   return (
//     <AuthContext.Provider value={value}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// // =========================================================
// // useAuth HOOK
// // =========================================================

// export const useAuth = () => {
//   const context = useContext(AuthContext);

//   if (!context) {
//     throw new Error(
//       "useAuth must be used inside an AuthProvider."
//     );
//   }

//   return context;
// };

// export default AuthContext;