import fs from 'fs';

// Load the parser (we'll define it directly since it's a small function)
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

// Test with specific URL
const testUrl = 'https://www.google.com/maps/@51.8114178,19.4684854,3a,75y,231.44h,97.65t/data=!3m7!1e1!3m5!1s9nXbRoEDdIP_Nra2T9UD2g!2e0!6shttps:%2F%2Fstreetviewpixels-pa.googleapis.com%2Fv1%2Fthumbnail%3Fcb_client%3Dmaps_sv.tactile%26w%3D900%26h%3D600%26pitch%3D-7.653027784829149%26panoid%3D9nXbRoEDdIP_Nra2T9UD2g%26yaw%3D231.43853022351698!7i13312!8i6656?entry=ttu&g_ep=EgoyMDI2MDIwMS4wIKXMDSoASAFQAw%3D%3D';

const params = extractStreetViewParams(testUrl);
console.log('=== Google Street View URL Parser ===');
console.log('');
console.log('Test URL:', testUrl);
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