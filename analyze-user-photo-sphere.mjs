const url = 'https://www.google.com/maps/@51.7670408,19.452748,3a,75y,176.35h,100.06t/data=!3m8!1e1!3m6!1sCIHM0ogKEICAgID4yo72nQE!2e10!3e11!6shttps:%2F%2Flh3.googleusercontent.com%2Fgpms-cs-s%2FAFfmt2ZEx6yUF86uxnUAxhfry0DirdktlM9DKk5cSCl78xluX7cquq6-Wzm-gX1LuN8B3u7vVcZJMHhEDrydhwO__l_tSDnXmApwbawQXgM_sVTgZFpXZYv-2MgTmeFV2y6CbEJcJv_p%3Dw900-h600-k-no-pi-10.05783810023732-ya141.3523286902394-ro0-fo100!7i13312!8i6656?entry=ttu&g_ep=EgoyMDI2MDIwMS4wIKXMDSoASAFQAw%3D%3D';

console.log('=== User-Contributed Photo Sphere URL Analysis ===');
console.log('Full URL:', url);
console.log();

// Analyze URL structure
const urlObj = new URL(url);

console.log('=== URL Structure ===');
console.log('Protocol:', urlObj.protocol);
console.log('Hostname:', urlObj.hostname);
console.log('Pathname:', urlObj.pathname);
console.log('Search params:', Object.fromEntries(urlObj.searchParams.entries()));
console.log();

// Analyze the @ parameter
const atMatch = url.match(/@([^/]+)/);
if (atMatch) {
    console.log('=== @ Parameters ===');
    const params = atMatch[1].split(',');
    console.log('Parameters:', params);
    
    params.forEach((param, index) => {
        const unitMatch = param.match(/(\d+(?:\.\d+)?)([a-zA-Z]+)/);
        if (unitMatch) {
            console.log(`  Param ${index}: Value=${unitMatch[1]}, Unit=${unitMatch[2]}`);
        } else {
            console.log(`  Param ${index}: Value=${param}`);
        }
    });
}
console.log();

// Analyze data parameter
const dataMatch = url.match(/data=([^?]+)/);
if (dataMatch) {
    console.log('=== Data Parameter ===');
    const dataParams = dataMatch[1].split('!').filter(Boolean);
    dataParams.forEach((param, index) => {
        console.log(`  Param ${index + 1}: ${param}`);
    });
    
    // Look for thumbnail URL
    const thumbnailParam = dataParams.find(p => p.startsWith('6s'));
    if (thumbnailParam) {
        console.log();
        console.log('=== Thumbnail URL ===');
        const thumbnailUrl = decodeURIComponent(thumbnailParam.substring(2));
        console.log('URL:', thumbnailUrl);
        
        const thumbnailObj = new URL(thumbnailUrl);
        console.log('Params:', Object.fromEntries(thumbnailObj.searchParams.entries()));
    }
}