function extractStreetViewParams(url) {
    try {
        // Extract panorama ID
        const idMatch = url.match(/!1s([^!]+)/);
        if (!idMatch) return null;
        const id = idMatch[1];

        // Extract coordinates from URL params
        const coordsMatch = url.match(/@([-+]?\d*\.?\d+),([-+]?\d*\.?\d+)/);
        if (!coordsMatch) return null;
        const lat = parseFloat(coordsMatch[1]);
        const lng = parseFloat(coordsMatch[2]);

        // Extract pitch and heading - support both URL formats
        let pitch;
        let heading;

        // Format 1: Standard Google Street View (streetviewpixels-pa.googleapis.com)
        const standardMatch = url.match(/pitch%3D([-+]?\d*\.?\d+)%26panoid%3D[^%]+%26yaw%3D([-+]?\d*\.?\d+)/);
        if (standardMatch) {
            pitch = parseFloat(standardMatch[1]);
            heading = parseFloat(standardMatch[2]);
        } else {
            // Format 2: User-contributed photo spheres (lh3.googleusercontent.com)
            const userContributedPitchMatch = url.match(/pi-([-+]?\d*\.?\d+)/);
            const userContributedHeadingMatch = url.match(/ya(\d+(\.\d+)?)/);
            
            if (userContributedPitchMatch) {
                pitch = parseFloat(userContributedPitchMatch[1]);
            }
            
            // Check for ya parameter in various formats
            if (userContributedHeadingMatch) {
                heading = parseFloat(userContributedHeadingMatch[1]);
            } else {
                const yaDashMatch = url.match(/ya-([-+]?\d*\.?\d+)/);
                if (yaDashMatch) {
                    heading = parseFloat(yaDashMatch[1]);
                }
            }
            
            // Fallback to @ parameters
            if (!heading) {
                const headingMatch = url.match(/@[^,]+,[^,]+,[^,]+,[^,]+,([\d.]+)h/);
                if (headingMatch) {
                    heading = parseFloat(headingMatch[1]);
                }
            }
            
            if (!pitch) {
                const pitchMatch = url.match(/@[^,]+,[^,]+,[^,]+,[^,]+,[^,]+,([\d.]+)t/);
                if (pitchMatch) {
                    // The "t" parameter is not pitch but something else - cap to reasonable range
                    const rawPitch = parseFloat(pitchMatch[1]);
                    pitch = rawPitch > 90 ? 90 : (rawPitch < -90 ? -90 : rawPitch);
                }
            }
        }

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
        } else {
            // Check for FOV in user-contributed format (fo parameter)
            const foMatch = url.match(/fo-(\d+)/);
            if (foMatch) {
                fov = parseFloat(foMatch[1]);
                const minFov = 10;
                const maxFov = 120;
                zoom = Math.max(0, Math.min(1, 1 - (fov - minFov) / (maxFov - minFov)));
            }
        }

        // Extract image dimensions
        const widthMatch = url.match(/!7i(\d+)/);
        const heightMatch = url.match(/!8i(\d+)/);
        const imageWidth = widthMatch ? parseInt(widthMatch[1]) : undefined;
        const imageHeight = heightMatch ? parseInt(heightMatch[1]) : undefined;

        return {
            id,
            pitch: pitch ?? 0,
            heading: heading ?? 0,
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

// Test with user-contributed photo sphere URL
const url = 'https://www.google.com/maps/@51.7670408,19.452748,3a,75y,176.35h,100.06t/data=!3m8!1e1!3m6!1sCIHM0ogKEICAgID4yo72nQE!2e10!3e11!6shttps:%2F%2Flh3.googleusercontent.com%2Fgpms-cs-s%2FAFfmt2ZEx6yUF86uxnUAxhfry0DirdktlM9DKk5cSCl78xluX7cquq6-Wzm-gX1LuN8B3u7vVcZJMHhEDrydhwO__l_tSDnXmApwbawQXgM_sVTgZFpXZYv-2MgTmeFV2y6CbEJcJv_p%3Dw900-h600-k-no-pi-10.05783810023732-ya141.3523286902394-ro0-fo100!7i13312!8i6656?entry=ttu&g_ep=EgoyMDI2MDIwMS4wIKXMDSoASAFQAw%3D%3D';

const params = extractStreetViewParams(url);

console.log('=== User-Contributed Photo Sphere Test ===');
if (params) {
    console.log('Successfully extracted parameters:');
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
    console.log('Failed to extract parameters from the URL');
}