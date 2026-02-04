const url = 'https://www.google.com/maps/@51.8114178,19.4684854,3a,75y,231.44h,97.65t/data=!3m7!1e1!3m5!1s9nXbRoEDdIP_Nra2T9UD2g!2e0!6shttps:%2F%2Fstreetviewpixels-pa.googleapis.com%2Fv1%2Fthumbnail%3Fcb_client%3Dmaps_sv.tactile%26w%3D900%26h%3D600%26pitch%3D-7.653027784829149%26panoid%3D9nXbRoEDdIP_Nra2T9UD2g%26yaw%3D231.43853022351698!7i13312!8i6656?entry=ttu&g_ep=EgoyMDI2MDIwMS4wIKXMDSoASAFQAw%3D%3D';

console.log('=== URL Analysis ===');
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
        // Check for patterns like 3a, 75y, etc.
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