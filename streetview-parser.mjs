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

// Usage examples
async function main() {
    const readline = (await import('readline')).createInterface({
        input: process.stdin,
        output: process.stdout
    });

    if (process.argv.length > 2) {
        // If URL is provided as command line argument
        const url = process.argv[2];
        const params = extractStreetViewParams(url);
        if (params) {
            console.log('=== Google Street View URL Parser ===');
            console.log('');
            console.log('Extracted parameters:');
            console.log('ID:', params.id);
            console.log('Pitch:', params.pitch);
            console.log('Heading:', params.heading);
            console.log('Latitude:', params.lat);
            console.log('Longitude:', params.lng);
            console.log('');
            console.log('JSON format:');
            console.log(JSON.stringify(params, null, 2));
        } else {
            console.error('Failed to extract parameters from the URL. Please make sure you entered a valid Google Street View URL.');
        }
        readline.close();
    } else {
        // Interactive mode
        console.log('=== Google Street View URL Parser ===');
        console.log('Enter a Google Maps Street View URL (or type "exit" to quit):');
        
        readline.on('line', (input) => {
            if (input.toLowerCase() === 'exit') {
                readline.close();
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

        readline.on('close', () => {
            console.log('\nParser exited.');
        });
    }
}

// Run the main function
main();

export { extractStreetViewParams };