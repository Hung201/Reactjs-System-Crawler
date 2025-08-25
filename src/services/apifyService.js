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

        try {
            const response = await fetch(url, config);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Response error text:', errorText);
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Apify API request failed:', error);

            // Try with no-cors mode as fallback
            if (error.message.includes('CORS')) {
                try {
                    const response = await fetch(url, {
                        method: 'GET',
                        headers: {
                            'Accept': 'application/json'
                        },
                        mode: 'no-cors'
                    });

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
            const data = await this.makeRequest(`/acts?token=${this.apiToken}`);

            // Transform Apify response to our format
            // Based on actual API response: { data: { items: [...] } }
            const actors = data.data?.items || [];

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
            const requestBody = JSON.stringify(input);

            const data = await this.makeRequest(`/acts/${actorId}/runs?token=${this.apiToken}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: requestBody
            });

            return data;
        } catch (error) {
            console.error('Error running actor:', error);
            throw new Error(`Failed to run actor: ${error.message}`);
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

    // Get actor runs with pagination
    async getActorRuns(actorId, limit = 20, offset = 0) {
        try {
            const data = await this.makeRequest(`/acts/${actorId}/runs?token=${this.apiToken}&limit=${limit}&offset=${offset}`);

            return data;
        } catch (error) {
            console.error('Error fetching actor runs:', error);
            throw new Error('Failed to fetch actor runs');
        }
    }

    // Get actor builds with pagination
    async getActorBuilds(actorId, limit = 20, offset = 0) {
        try {
            const data = await this.makeRequest(`/acts/${actorId}/builds?token=${this.apiToken}&limit=${limit}&offset=${offset}`);

            return data;
        } catch (error) {
            console.error('Error fetching actor builds:', error);
            throw new Error('Failed to fetch actor builds');
        }
    }

    // Get run logs
    async getRunLogs(runId) {
        try {
            const url = `${this.baseURL}/logs/${runId}?token=${this.apiToken}`;

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'text/plain, application/json'
                },
                mode: 'cors'
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Logs response error text:', errorText);
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }

            // Logs thường là text, không phải JSON
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                const data = await response.json();
                return data;
            } else {
                const text = await response.text();
                return text;
            }
        } catch (error) {
            console.error('Error fetching run logs:', error);
            throw new Error(`Failed to fetch run logs: ${error.message}`);
        }
    }

    // Get run details
    async getRun(runId) {
        try {
            const url = `${this.baseURL}/actor-runs/${runId}?token=${this.apiToken}`;

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                },
                mode: 'cors'
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Run response error text:', errorText);
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }

            const responseData = await response.json();

            // Xử lý cấu trúc response có thể có data wrapper
            const data = responseData.data || responseData;

            // Kiểm tra các trường có thể chứa dataset ID
            const possibleDatasetFields = [
                'defaultDatasetId',
                'datasetId',
                'defaultDataset',
                'dataset',
                'storage',
                'output'
            ];

            for (const field of possibleDatasetFields) {
                if (data[field]) {
                }
            }

            return data;
        } catch (error) {
            console.error('Error fetching run details:', error);
            throw new Error(`Failed to fetch run details: ${error.message}`);
        }
    }

    // Get run dataset using defaultDatasetId
    async getRunDataset(runId) {
        try {
            // First, get run details to get defaultDatasetId
            const runDetails = await this.getRun(runId);

            // Tìm dataset ID từ nhiều trường có thể có
            let datasetId = null;

            // Thứ tự ưu tiên tìm dataset ID
            const datasetIdFields = [
                'defaultDatasetId',
                'datasetId',
                'defaultDataset',
                'dataset'
            ];

            for (const field of datasetIdFields) {
                if (runDetails[field]) {
                    datasetId = runDetails[field];
                    break;
                }
            }

            // Nếu không tìm thấy, kiểm tra các trường nested
            if (!datasetId && runDetails.storage) {
                if (runDetails.storage.defaultDatasetId) {
                    datasetId = runDetails.storage.defaultDatasetId;
                }
            }

            if (!datasetId) {
                console.error('No dataset ID found in run details. Available fields:', Object.keys(runDetails));
                throw new Error('No dataset ID found in run details. Run may not have completed or may not have generated a dataset.');
            }

            // Now get dataset using datasetId
            const url = `${this.baseURL}/datasets/${datasetId}/items?clean=true&format=json&token=${this.apiToken}`;

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                },
                mode: 'cors'
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Dataset response error text:', errorText);
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching run dataset:', error);
            throw new Error(`Failed to fetch run dataset: ${error.message}`);
        }
    }

    // Get dataset info using defaultDatasetId
    async getDatasetInfo(runId) {
        try {
            // First, get run details to get defaultDatasetId
            const runDetails = await this.getRun(runId);

            // Tìm dataset ID từ nhiều trường có thể có
            let datasetId = null;

            // Thứ tự ưu tiên tìm dataset ID
            const datasetIdFields = [
                'defaultDatasetId',
                'datasetId',
                'defaultDataset',
                'dataset'
            ];

            for (const field of datasetIdFields) {
                if (runDetails[field]) {
                    datasetId = runDetails[field];
                    break;
                }
            }

            // Nếu không tìm thấy, kiểm tra các trường nested
            if (!datasetId && runDetails.storage) {
                if (runDetails.storage.defaultDatasetId) {
                    datasetId = runDetails.storage.defaultDatasetId;
                }
            }

            if (!datasetId) {
                console.error('No dataset ID found in run details. Available fields:', Object.keys(runDetails));
                throw new Error('No dataset ID found in run details. Run may not have completed or may not have generated a dataset.');
            }

            const url = `${this.baseURL}/datasets/${datasetId}?token=${this.apiToken}`;

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                },
                mode: 'cors'
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Dataset Info response error text:', errorText);
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }

            const responseData = await response.json();
            const data = responseData.data || responseData;
            return data;
        } catch (error) {
            console.error('Error fetching dataset info:', error);
            throw new Error(`Failed to fetch dataset info: ${error.message}`);
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
