// Mock data for testing without backend
export const mockDashboardData = {
    stats: {
        totalData: 1247,
        totalSources: 23,
        totalUsers: 8,
        runningActors: 3
    },
    dataByStatus: {
        pending: 156,
        approved: 892,
        rejected: 199
    },
    recentData: [
        {
            id: 1,
            title: 'iPhone 15 Pro Max - Công nghệ mới nhất',
            description: 'Điện thoại iPhone 15 Pro Max với chip A17 Pro, camera 48MP...',
            type: 'product',
            status: 'approved',
            sourceName: 'Shopee Electronics',
            createdAt: '2024-01-15T10:30:00Z',
            image: 'https://via.placeholder.com/60x60/3B82F6/FFFFFF?text=📱'
        },
        {
            id: 2,
            title: 'Tin tức về AI và Machine Learning',
            description: 'Những xu hướng mới nhất trong lĩnh vực trí tuệ nhân tạo...',
            type: 'news',
            status: 'pending',
            sourceName: 'Tech News Daily',
            createdAt: '2024-01-15T09:15:00Z',
            image: 'https://via.placeholder.com/60x60/10B981/FFFFFF?text=📰'
        },
        {
            id: 3,
            title: 'Hướng dẫn React 18 mới nhất',
            description: 'Video hướng dẫn chi tiết về các tính năng mới trong React 18...',
            type: 'video',
            status: 'approved',
            sourceName: 'Dev Tutorials',
            createdAt: '2024-01-15T08:45:00Z',
            image: 'https://via.placeholder.com/60x60/EF4444/FFFFFF?text=🎥'
        }
    ]
};

export const mockSources = [
    {
        id: 1,
        name: 'Shopee Electronics',
        dataType: 'product',
        status: 'active',
        actorId: 'actor_shopee_products',
        schedule: 'daily',
        startUrls: ['https://shopee.vn/electronics'],
        createdAt: '2024-01-10T08:00:00Z',
        lastRun: '2024-01-15T06:00:00Z'
    },
    {
        id: 2,
        name: 'Tech News Daily',
        dataType: 'news',
        status: 'active',
        actorId: 'actor_tech_news',
        schedule: 'hourly',
        startUrls: ['https://technews.com', 'https://techcrunch.com'],
        createdAt: '2024-01-08T10:30:00Z',
        lastRun: '2024-01-15T09:00:00Z'
    },
    {
        id: 3,
        name: 'Dev Tutorials',
        dataType: 'video',
        status: 'inactive',
        actorId: 'actor_youtube_tutorials',
        schedule: 'weekly',
        startUrls: ['https://youtube.com/channel/devtutorials'],
        createdAt: '2024-01-05T14:20:00Z',
        lastRun: '2024-01-12T15:30:00Z'
    }
];

export const mockCrawlData = [
    {
        id: 1,
        title: 'iPhone 15 Pro Max - Công nghệ mới nhất',
        description: 'Điện thoại iPhone 15 Pro Max với chip A17 Pro, camera 48MP, màn hình 6.7 inch Super Retina XDR OLED...',
        content: 'Chi tiết sản phẩm iPhone 15 Pro Max với giá 29.990.000 VNĐ...',
        type: 'product',
        status: 'approved',
        sourceName: 'Shopee Electronics',
        rawUrl: 'https://shopee.vn/iphone-15-pro-max',
        createdAt: '2024-01-15T10:30:00Z',
        image: 'https://via.placeholder.com/60x60/3B82F6/FFFFFF?text=📱'
    },
    {
        id: 2,
        title: 'Tin tức về AI và Machine Learning',
        description: 'Những xu hướng mới nhất trong lĩnh vực trí tuệ nhân tạo và học máy...',
        content: 'AI đang thay đổi cách chúng ta làm việc và sinh sống...',
        type: 'news',
        status: 'pending',
        sourceName: 'Tech News Daily',
        rawUrl: 'https://technews.com/ai-machine-learning-2024',
        createdAt: '2024-01-15T09:15:00Z',
        image: 'https://via.placeholder.com/60x60/10B981/FFFFFF?text=📰'
    },
    {
        id: 3,
        title: 'Hướng dẫn React 18 mới nhất',
        description: 'Video hướng dẫn chi tiết về các tính năng mới trong React 18...',
        content: 'React 18 giới thiệu nhiều tính năng mới như Concurrent Features...',
        type: 'video',
        status: 'approved',
        sourceName: 'Dev Tutorials',
        rawUrl: 'https://youtube.com/watch?v=react18-tutorial',
        createdAt: '2024-01-15T08:45:00Z',
        image: 'https://via.placeholder.com/60x60/EF4444/FFFFFF?text=🎥'
    }
];

export const mockUsers = [
    {
        id: 1,
        name: 'Admin User',
        email: 'admin@example.com',
        role: 'admin',
        status: 'active',
        createdAt: '2024-01-01T00:00:00Z',
        avatar: 'https://ui-avatars.com/api/?name=Admin+User&background=0D9488&color=fff'
    },
    {
        id: 2,
        name: 'Editor User',
        email: 'editor@example.com',
        role: 'editor',
        status: 'active',
        createdAt: '2024-01-02T00:00:00Z',
        avatar: 'https://ui-avatars.com/api/?name=Editor+User&background=3B82F6&color=fff'
    },
    {
        id: 3,
        name: 'Viewer User',
        email: 'viewer@example.com',
        role: 'viewer',
        status: 'active',
        createdAt: '2024-01-03T00:00:00Z',
        avatar: 'https://ui-avatars.com/api/?name=Viewer+User&background=6B7280&color=fff'
    }
];

export const mockActors = [
    {
        id: 1,
        name: 'Shopee Products Crawler',
        actorId: 'actor_shopee_products',
        status: 'active',
        version: '1.2.0',
        description: 'Crawler cho sản phẩm điện tử trên Shopee',
        createdAt: '2024-01-10T08:00:00Z',
        lastRun: '2024-01-15T06:00:00Z'
    },
    {
        id: 2,
        name: 'Tech News Crawler',
        actorId: 'actor_tech_news',
        status: 'active',
        version: '2.1.0',
        description: 'Crawler cho tin tức công nghệ',
        createdAt: '2024-01-08T10:30:00Z',
        lastRun: '2024-01-15T09:00:00Z'
    },
    {
        id: 3,
        name: 'YouTube Tutorials Crawler',
        actorId: 'actor_youtube_tutorials',
        status: 'inactive',
        version: '1.0.5',
        description: 'Crawler cho video hướng dẫn trên YouTube',
        createdAt: '2024-01-05T14:20:00Z',
        lastRun: '2024-01-12T15:30:00Z'
    }
];

export const mockRunLogs = [
    {
        id: 1,
        actorName: 'Shopee Products Crawler',
        actorId: 'actor_shopee_products',
        status: 'completed',
        triggeredBy: 'admin@example.com',
        startTime: '2024-01-15T06:00:00Z',
        endTime: '2024-01-15T06:15:00Z',
        duration: '15 phút',
        dataCollected: 45,
        errors: 0
    },
    {
        id: 2,
        actorName: 'Tech News Crawler',
        actorId: 'actor_tech_news',
        status: 'running',
        triggeredBy: 'editor@example.com',
        startTime: '2024-01-15T09:00:00Z',
        endTime: null,
        duration: 'Đang chạy',
        dataCollected: 12,
        errors: 0
    },
    {
        id: 3,
        actorName: 'YouTube Tutorials Crawler',
        actorId: 'actor_youtube_tutorials',
        status: 'failed',
        triggeredBy: 'admin@example.com',
        startTime: '2024-01-12T15:30:00Z',
        endTime: '2024-01-12T15:32:00Z',
        duration: '2 phút',
        dataCollected: 0,
        errors: 3
    }
]; 