function extractStreetViewParams(url) {
    try {
        const idMatch = url.match(/!1s([^!]+)/);
        if (!idMatch) return null;
        const id = idMatch[1];

        const thumbnailMatch = url.match(/pitch%3D([-+]?\d*\.?\d+)%26panoid%3D[^%]+%26yaw%3D([-+]?\d*\.?\d+)/);
        if (!thumbnailMatch) return null;
        const pitch = parseFloat(thumbnailMatch[1]);
        const heading = parseFloat(thumbnailMatch[2]);

        const coordsMatch = url.match(/@([-+]?\d*\.?\d+),([-+]?\d*\.?\d+)/);
        if (!coordsMatch) return null;
        const lat = parseFloat(coordsMatch[1]);
        const lng = parseFloat(coordsMatch[2]);

        return { id, pitch, heading, lat, lng };
    } catch (error) {
        console.error('Error extracting Street View parameters:', error);
        return null;
    }
}

// Example usage
if (require.main === module) {
    // If run directly from Node.js
    const readline = require('readline');
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    console.log('=== Google Street View URL Parser ===');
    console.log('Enter a Google Maps Street View URL (or type "exit" to quit):');
    
    rl.on('line', (input) => {
        if (input.toLowerCase() === 'exit') {
            rl.close();
            return;
        }

        if (input.trim()) {
            const params = extractStreetViewParams(input.trim());
            if (params) {
                console.log('\nSuccessfully extracted parameters:');
                console.log('ID:', params.id);
                console.log('Pitch:', params.pitch);
                console.log('Heading:', params.heading);
                console.log('Latitude:', params.lat);
                console.log('Longitude:', params.lng);
                console.log('');
                console.log('JSON format:');
                console.log(JSON.stringify(params, null, 2));
            } else {
                console.log('\nFailed to extract parameters from the URL.');
                console.log('Please make sure you entered a valid Google Street View URL.');
            }
        }

        console.log('\nEnter a Google Maps Street View URL (or type "exit" to quit):');
    });

    rl.on('close', () => {
        console.log('\nParser exited.');
    });
}