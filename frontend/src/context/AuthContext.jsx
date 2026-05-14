import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getCurrentUser, loginUser, logoutUser, registerUser } from '../api/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;

        getCurrentUser()
            .then((res) => {
                if (active) {
                    setUser(res.user || null);
                }
            })
            .catch(() => {
                if (active) {
                    setUser(null);
                }
            })
            .finally(() => {
                if (active) {
                    setLoading(false);
                }
            });

        return () => {
            active = false;
        };
    }, []);

    const value = useMemo(
        () => ({
            user,
            loading,
            isAdmin: user?.role === 'admin' && user?.status === 'approved',
            isOperator: user?.role === 'operator' && user?.status === 'approved',
            async login(payload) {
                const res = await loginUser(payload);
                setUser(res.user || null);
                return res;
            },
            async register(payload) {
                return registerUser(payload);
            },
            async logout() {
                await logoutUser();
                setUser(null);
            },
            refreshUser: async () => {
                const res = await getCurrentUser();
                setUser(res.user || null);
                return res.user || null;
            },
        }),
        [user, loading],
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth error');
    }
    return context;
}
