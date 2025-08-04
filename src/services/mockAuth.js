// Mock authentication service for testing without backend
const demoUsers = {
    'admin@example.com': {
        id: 1,
        email: 'admin@example.com',
        name: 'Admin User',
        role: 'admin',
        avatar: 'https://ui-avatars.com/api/?name=Admin+User&background=0D9488&color=fff'
    },
    'editor@example.com': {
        id: 2,
        email: 'editor@example.com',
        name: 'Editor User',
        role: 'editor',
        avatar: 'https://ui-avatars.com/api/?name=Editor+User&background=3B82F6&color=fff'
    },
    'viewer@example.com': {
        id: 3,
        email: 'viewer@example.com',
        name: 'Viewer User',
        role: 'viewer',
        avatar: 'https://ui-avatars.com/api/?name=Viewer+User&background=6B7280&color=fff'
    }
};

const mockAuthService = {
    login: async (email, password) => {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Check if user exists and password is correct
        if (demoUsers[email] && password === 'password123') {
            const user = demoUsers[email];
            const token = `mock-jwt-token-${user.id}-${Date.now()}`;

            return {
                success: true,
                data: {
                    user,
                    token,
                    expiresIn: 3600
                }
            };
        } else {
            throw new Error('Email hoặc mật khẩu không đúng');
        }
    },

    checkAuth: async (token) => {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));

        // Extract user ID from mock token
        const match = token.match(/mock-jwt-token-(\d+)/);
        if (match) {
            const userId = parseInt(match[1]);
            const user = Object.values(demoUsers).find(u => u.id === userId);
            if (user) {
                return {
                    success: true,
                    data: { user }
                };
            }
        }

        throw new Error('Token không hợp lệ');
    }
};

export default mockAuthService; 