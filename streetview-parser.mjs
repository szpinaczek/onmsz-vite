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

        // Extract field of view (FOV) - look for patterns like 75y
        const fovMatch = url.match(/@[^,]+,[^,]+,[^,]+,([\d.]+)y/);
        let fov;
        let zoom;
        if (fovMatch) {
            fov = parseFloat(fovMatch[1]);
            // Convert FOV to zoom (0-1, where 0 is most zoomed out, 1 is most zoomed in)
            const minFov = 10;
            const maxFov = 120;
            zoom = Math.max(0, Math.min(1, 1 - (fov - minFov) / (maxFov - minFov)));
        }

        // Extract image dimensions
        const widthMatch = url.match(/!7i(\d+)/);
        const heightMatch = url.match(/!8i(\d+)/);
        const imageWidth = widthMatch ? parseInt(widthMatch[1]) : undefined;
        const imageHeight = heightMatch ? parseInt(heightMatch[1]) : undefined;

        return {
            id,
            pitch,
            heading,
            lat,
            lng,
            fov,
            zoom,
            imageWidth,
            imageHeight
        };
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
            if (params.fov !== undefined) console.log('FOV:', params.fov);
            if (params.zoom !== undefined) console.log('Zoom:', params.zoom.toFixed(3));
            if (params.imageWidth !== undefined) console.log('Image Width:', params.imageWidth);
            if (params.imageHeight !== undefined) console.log('Image Height:', params.imageHeight);
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
                    if (params.fov !== undefined) console.log('FOV:', params.fov);
                    if (params.zoom !== undefined) console.log('Zoom:', params.zoom.toFixed(3));
                    if (params.imageWidth !== undefined) console.log('Image Width:', params.imageWidth);
                    if (params.imageHeight !== undefined) console.log('Image Height:', params.imageHeight);
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