const url = 'https://www.google.com/maps/@51.7670408,19.452748,3a,75y,176.35h,100.06t/data=!3m8!1e1!3m6!1sCIHM0ogKEICAgID4yo72nQE!2e10!3e11!6shttps:%2F%2Flh3.googleusercontent.com%2Fgpms-cs-s%2FAFfmt2ZEx6yUF86uxnUAxhfry0DirdktlM9DKk5cSCl78xluX7cquq6-Wzm-gX1LuN8B3u7vVcZJMHhEDrydhwO__l_tSDnXmApwbawQXgM_sVTgZFpXZYv-2MgTmeFV2y6CbEJcJv_p%3Dw900-h600-k-no-pi-10.05783810023732-ya141.3523286902394-ro0-fo100!7i13312!8i6656?entry=ttu&g_ep=EgoyMDI2MDIwMS4wIKXMDSoASAFQAw%3D%3D';

// Extract thumbnail URL
const dataMatch = url.match(/data=([^?]+)/);
if (dataMatch) {
    const dataParams = dataMatch[1].split('!').filter(Boolean);
    const thumbnailParam = dataParams.find(p => p.startsWith('6s'));
    if (thumbnailParam) {
        const thumbnailUrl = decodeURIComponent(thumbnailParam.substring(2));
        console.log('Thumbnail URL:', thumbnailUrl);
        
        // Test pitch extraction
        const piMatch = thumbnailUrl.match(/pi-([-+]?\d*\.?\d+)/);
        console.log('piMatch:', piMatch);
        
        const yaMatch = thumbnailUrl.match(/ya-([-+]?\d*\.?\d+)/);
        console.log('yaMatch:', yaMatch);
        
        // Extract all parameters from thumbnail
        console.log('Parameters in thumbnail:', Array.from(thumbnailUrl.matchAll(/([a-z]+)-([-+]?\d*\.?\d+)/g)));
    }
}