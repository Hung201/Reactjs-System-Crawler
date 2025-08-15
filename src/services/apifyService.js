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
            console.log('=== Running Actor ===');
            console.log('Actor ID:', actorId);
            console.log('Input data:', input);
            console.log('API Token:', this.apiToken ? 'Present' : 'Missing');

            const requestBody = JSON.stringify(input);
            console.log('Request body:', requestBody);

            const data = await this.makeRequest(`/acts/${actorId}/runs?token=${this.apiToken}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: requestBody
            });

            console.log('Run actor response:', data);
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
            console.log('=== Getting Actor Runs ===');
            console.log('Actor ID:', actorId);
            console.log('Limit:', limit);
            console.log('Offset:', offset);

            const data = await this.makeRequest(`/acts/${actorId}/runs?token=${this.apiToken}&limit=${limit}&offset=${offset}`);

            console.log('Actor runs response:', data);
            return data;
        } catch (error) {
            console.error('Error fetching actor runs:', error);
            throw new Error('Failed to fetch actor runs');
        }
    }

    // Get actor builds with pagination
    async getActorBuilds(actorId, limit = 20, offset = 0) {
        try {
            console.log('=== Getting Actor Builds ===');
            console.log('Actor ID:', actorId);
            console.log('Limit:', limit);
            console.log('Offset:', offset);

            const data = await this.makeRequest(`/acts/${actorId}/builds?token=${this.apiToken}&limit=${limit}&offset=${offset}`);

            console.log('Actor builds response:', data);
            return data;
        } catch (error) {
            console.error('Error fetching actor builds:', error);
            throw new Error('Failed to fetch actor builds');
        }
    }

    // Get run logs
    async getRunLogs(runId) {
        try {
            console.log('=== Getting Run Logs ===');
            console.log('Run ID:', runId);

            const url = `${this.baseURL}/logs/${runId}?token=${this.apiToken}`;
            console.log('Logs URL:', url);

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'text/plain, application/json'
                },
                mode: 'cors'
            });

            console.log('Logs response status:', response.status);
            console.log('Logs response headers:', response.headers);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Logs response error text:', errorText);
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }

            // Logs thường là text, không phải JSON
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                const data = await response.json();
                console.log('Logs JSON response:', data);
                return data;
            } else {
                const text = await response.text();
                console.log('Logs text response length:', text.length);
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
            console.log('=== Getting Run Details ===');
            console.log('Run ID:', runId);

            const url = `${this.baseURL}/actor-runs/${runId}?token=${this.apiToken}`;
            console.log('Run URL:', url);

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                },
                mode: 'cors'
            });

            console.log('Run response status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Run response error text:', errorText);
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }

            const responseData = await response.json();
            console.log('Raw response data:', responseData);

            // Xử lý cấu trúc response có thể có data wrapper
            const data = responseData.data || responseData;
            console.log('Processed run data:', data);

            // Log tất cả các keys trong response để tìm defaultDatasetId
            console.log('Run response keys:', Object.keys(data));
            console.log('Run response defaultDatasetId:', data.defaultDatasetId);
            console.log('Run response datasetId:', data.datasetId);
            console.log('Run response defaultKeyValueStoreId:', data.defaultKeyValueStoreId);
            console.log('Run response defaultRequestQueueId:', data.defaultRequestQueueId);

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
                    console.log(`Found dataset field "${field}":`, data[field]);
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
            console.log('=== Getting Run Dataset ===');
            console.log('Run ID:', runId);

            // First, get run details to get defaultDatasetId
            const runDetails = await this.getRun(runId);
            console.log('Run details:', runDetails);

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
                    console.log(`Found dataset ID in field "${field}":`, datasetId);
                    break;
                }
            }

            // Nếu không tìm thấy, kiểm tra các trường nested
            if (!datasetId && runDetails.storage) {
                console.log('Checking storage field:', runDetails.storage);
                if (runDetails.storage.defaultDatasetId) {
                    datasetId = runDetails.storage.defaultDatasetId;
                    console.log('Found dataset ID in storage.defaultDatasetId:', datasetId);
                }
            }

            if (!datasetId) {
                console.error('No dataset ID found in run details. Available fields:', Object.keys(runDetails));
                throw new Error('No dataset ID found in run details. Run may not have completed or may not have generated a dataset.');
            }

            console.log('Using Dataset ID:', datasetId);

            // Now get dataset using datasetId
            const url = `${this.baseURL}/datasets/${datasetId}/items?clean=true&format=json&token=${this.apiToken}`;
            console.log('Dataset URL:', url);

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                },
                mode: 'cors'
            });

            console.log('Dataset response status:', response.status);
            console.log('Dataset response headers:', response.headers);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Dataset response error text:', errorText);
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }

            const data = await response.json();
            console.log('Dataset response data length:', data.length);
            return data;
        } catch (error) {
            console.error('Error fetching run dataset:', error);
            throw new Error(`Failed to fetch run dataset: ${error.message}`);
        }
    }

    // Get dataset info using defaultDatasetId
    async getDatasetInfo(runId) {
        try {
            console.log('=== Getting Dataset Info ===');
            console.log('Run ID:', runId);

            // First, get run details to get defaultDatasetId
            const runDetails = await this.getRun(runId);
            console.log('Run details for dataset info:', runDetails);

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
                    console.log(`Found dataset ID in field "${field}":`, datasetId);
                    break;
                }
            }

            // Nếu không tìm thấy, kiểm tra các trường nested
            if (!datasetId && runDetails.storage) {
                console.log('Checking storage field:', runDetails.storage);
                if (runDetails.storage.defaultDatasetId) {
                    datasetId = runDetails.storage.defaultDatasetId;
                    console.log('Found dataset ID in storage.defaultDatasetId:', datasetId);
                }
            }

            if (!datasetId) {
                console.error('No dataset ID found in run details. Available fields:', Object.keys(runDetails));
                throw new Error('No dataset ID found in run details. Run may not have completed or may not have generated a dataset.');
            }

            console.log('Default Dataset ID for info:', datasetId);

            const url = `${this.baseURL}/datasets/${datasetId}?token=${this.apiToken}`;
            console.log('Dataset Info URL:', url);

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                },
                mode: 'cors'
            });

            console.log('Dataset Info response status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Dataset Info response error text:', errorText);
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }

            const responseData = await response.json();
            const data = responseData.data || responseData;
            console.log('Dataset Info response data:', data);
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
