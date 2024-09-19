const createRequest = async (options) => {
    const { url, method = 'GET', data = {}, headers = {} } = options;

    try {
        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                ...headers,
            },
            body: method !== 'GET' ? JSON.stringify(data) : undefined,
        });

        if (!response.ok) {
            throw new Error (`HTTP error! Status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error with request:', error);
        throw error;
    }
};

export default createRequest;
