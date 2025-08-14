class ApifyService {
    constructor(apiToken) {
        this.apiToken = apiToken;
        this.baseURL = 'https://api.apify.com/v2';
    }

    // Helper method to make API calls
    async makeRequest(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            },
            mode: 'cors',
            ...options
        };

        console.log('Making request to:', url);
        console.log('Request config:', config);

        try {
            const response = await fetch(url, config);

            console.log('Response status:', response.status);
            console.log('Response headers:', response.headers);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Response error text:', errorText);
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }

            const data = await response.json();
            console.log('Response data:', data);
            return data;
        } catch (error) {
            console.error('Apify API request failed:', error);

            // Try with no-cors mode as fallback
            if (error.message.includes('CORS')) {
                console.log('CORS error detected, trying alternative approach...');
                try {
                    const response = await fetch(url, {
                        method: 'GET',
                        headers: {
                            'Accept': 'application/json'
                        },
                        mode: 'no-cors'
                    });

                    console.log('No-cors response status:', response.status);
                    // Note: no-cors mode has limited access to response data
                    throw new Error('CORS blocked - need proxy or backend solution');
                } catch (noCorsError) {
                    throw new Error(`CORS blocked: ${noCorsError.message}`);
                }
            }

            throw error;
        }
    }

    // Get list of actors
    async getActors() {
        try {
            console.log('=== getActors called ===');
            console.log('API Token:', this.apiToken);

            const data = await this.makeRequest(`/acts?token=${this.apiToken}`);

            console.log('Apify API Response:', data); // Debug log

            // Transform Apify response to our format
            // Based on actual API response: { data: { items: [...] } }
            const actors = data.data?.items || [];

            console.log('Raw actors from API:', actors);
            console.log('Raw actors length:', actors.length);

            if (!Array.isArray(actors)) {
                console.error('Actors is not an array:', actors);
                throw new Error('Invalid response format: actors is not an array');
            }

            const transformedActors = actors.map(actor => ({
                id: actor.id,
                name: actor.name || actor.title || 'Unknown Actor',
                description: actor.description || actor.title || 'No description available',
                version: actor.version,
                buildTag: actor.buildTag,
                createdAt: actor.createdAt,
                modifiedAt: actor.modifiedAt,
                isPublic: actor.isPublic || false,
                isDeprecated: actor.isDeprecated || false,
                isAnonymouslyRunnable: actor.isAnonymouslyRunnable || false,
                title: actor.title || actor.name,
                seoTitle: actor.seoTitle,
                categories: actor.categories || [],
                defaultRunOptions: actor.defaultRunOptions || {},
                exampleRunInput: actor.exampleRunInput || {},
                exampleRunOutput: actor.exampleRunOutput || {},
                inputSchema: actor.inputSchema || {},
                stats: actor.stats || {},
                runCount: actor.stats?.totalRuns || 0,
                userRuns: actor.stats?.userRuns || 0,
                meta: actor.meta || {},
                username: actor.username || 'unknown'
            }));

            console.log('Transformed actors:', transformedActors);
            console.log('Transformed actors length:', transformedActors.length);
            console.log('=== getActors completed ===');

            return transformedActors;
        } catch (error) {
            console.error('Error fetching actors:', error);
            console.error('Error stack:', error.stack);
            throw new Error('Failed to fetch actors from Apify');
        }
    }

    // Get specific actor details
    async getActor(actorId) {
        try {
            const data = await this.makeRequest(`/acts/${actorId}?token=${this.apiToken}`);
            return data;
        } catch (error) {
            console.error('Error fetching actor details:', error);
            throw new Error('Failed to fetch actor details');
        }
    }

    // Get actor input schema
    async getActorInputSchema(actorId) {
        try {
            const data = await this.makeRequest(`/acts/${actorId}/input-schema?token=${this.apiToken}`);
            return data;
        } catch (error) {
            console.error('Error fetching actor input schema:', error);
            throw new Error('Failed to fetch actor input schema');
        }
    }

    // Run an actor
    async runActor(actorId, input = {}) {
        try {
            const data = await this.makeRequest(`/acts/${actorId}/runs?token=${this.apiToken}`, {
                method: 'POST',
                body: JSON.stringify({ input })
            });
            return data;
        } catch (error) {
            console.error('Error running actor:', error);
            throw new Error('Failed to run actor');
        }
    }

    // Get run status
    async getRunStatus(runId) {
        try {
            const data = await this.makeRequest(`/runs/${runId}?token=${this.apiToken}`);
            return data;
        } catch (error) {
            console.error('Error fetching run status:', error);
            throw new Error('Failed to fetch run status');
        }
    }

    // Get run results
    async getRunResults(runId) {
        try {
            const data = await this.makeRequest(`/runs/${runId}/dataset/items?token=${this.apiToken}`);
            return data;
        } catch (error) {
            console.error('Error fetching run results:', error);
            throw new Error('Failed to fetch run results');
        }
    }

    // Get user info
    async getUserInfo() {
        try {
            const data = await this.makeRequest(`/users/me?token=${this.apiToken}`);
            return data;
        } catch (error) {
            console.error('Error fetching user info:', error);
            throw new Error('Failed to fetch user info');
        }
    }

    // Test API connection
    async testConnection() {
        try {
            const userInfo = await this.getUserInfo();
            return {
                success: true,
                user: userInfo,
                message: 'Connection successful'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Connection failed'
            };
        }
    }

    // Get actor store (public actors)
    async getActorStore(searchTerm = '', category = '') {
        try {
            let endpoint = `/acts?token=${this.apiToken}&isPublic=true`;

            if (searchTerm) {
                endpoint += `&search=${encodeURIComponent(searchTerm)}`;
            }

            if (category) {
                endpoint += `&category=${encodeURIComponent(category)}`;
            }

            const data = await this.makeRequest(endpoint);
            return data.data || [];
        } catch (error) {
            console.error('Error fetching actor store:', error);
            throw new Error('Failed to fetch actor store');
        }
    }

    // Get actor categories
    async getActorCategories() {
        try {
            const data = await this.makeRequest(`/acts?token=${this.apiToken}&isPublic=true`);
            const categories = new Set();

            data.data.forEach(actor => {
                if (actor.categories) {
                    actor.categories.forEach(category => categories.add(category));
                }
            });

            return Array.from(categories).sort();
        } catch (error) {
            console.error('Error fetching actor categories:', error);
            throw new Error('Failed to fetch actor categories');
        }
    }
}

export default ApifyService;
