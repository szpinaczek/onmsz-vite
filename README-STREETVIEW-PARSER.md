# Google Street View URL Parser

A simple tool to extract parameters from Google Street View URLs, including:
- Panorama ID
- Pitch
- Heading
- Latitude and Longitude

## Available Options

### 1. Browser Console Parser (`streetview-parser-console.html`)
A standalone HTML file that works directly in your browser.

#### How to use:
1. Open `streetview-parser-console.html` in any web browser
2. Paste your Google Street View URL into the input field
3. Click "Extract Parameters" or press Enter
4. View the extracted parameters in JSON format

#### Console usage:
You can also use the parser directly from your browser's JavaScript console:
```javascript
parseStreetViewURL('YOUR_STREET_VIEW_URL')
```

Example:
```javascript
parseStreetViewURL('https://www.google.com/maps/@51.8114178,19.4684854,3a,75y,231.44h,97.65t/data=!3m7!1e1!3m5!1s9nXbRoEDdIP_Nra2T9UD2g!2e0!6shttps:%2F%2Fstreetviewpixels-pa.googleapis.com%2Fv1%2Fthumbnail%3Fcb_client%3Dmaps_sv.tactile%26w%3D900%26h%3D600%26pitch%3D-7.653027784829149%26panoid%3D9nXbRoEDdIP_Nra2T9UD2g%26yaw%3D231.43853022351698!7i13312!8i6656?entry=ttu')
```

### 2. Node.js CLI Parser (`streetview-parser.mjs`)
A command-line version for Node.js.

#### Prerequisites:
- Node.js installed (version 14 or higher)

#### Usage with command line argument:
```bash
node streetview-parser.mjs "YOUR_STREET_VIEW_URL"
```

Example:
```bash
node streetview-parser.mjs "https://www.google.com/maps/@51.8114178,19.4684854,3a,75y,231.44h,97.65t/data=!3m7!1e1!3m5!1s9nXbRoEDdIP_Nra2T9UD2g!2e0!6shttps:%2F%2Fstreetviewpixels-pa.googleapis.com%2Fv1%2Fthumbnail%3Fcb_client%3Dmaps_sv.tactile%26w%3D900%26h%3D600%26pitch%3D-7.653027784829149%26panoid%3D9nXbRoEDdIP_Nra2T9UD2g%26yaw%3D231.43853022351698!7i13312!8i6656?entry=ttu"
```

#### Interactive mode:
Run without arguments for interactive mode:
```bash
node streetview-parser.mjs
```

Then paste your URL and press Enter. Type "exit" to quit.

### 3. TypeScript Library Function (`src/lib/utils.ts`)
For use in your TypeScript/JavaScript projects.

#### Usage:
```typescript
import { extractStreetViewParams } from '@/lib/utils';

const url = 'https://www.google.com/maps/@51.8114178,19.4684854,3a,75y,231.44h,97.65t/data=!3m7!1e1!3m5!1s9nXbRoEDdIP_Nra2T9UD2g!2e0!6shttps:%2F%2Fstreetviewpixels-pa.googleapis.com%2Fv1%2Fthumbnail%3Fcb_client%3Dmaps_sv.tactile%26w%3D900%26h%3D600%26pitch%3D-7.653027784829149%26panoid%3D9nXbRoEDdIP_Nra2T9UD2g%26yaw%3D231.43853022351698!7i13312!8i6656?entry=ttu';

const params = extractStreetViewParams(url);
if (params) {
    console.log('Panorama ID:', params.id);
    console.log('Pitch:', params.pitch);
    console.log('Heading:', params.heading);
    console.log('Location:', params.lat, ',', params.lng);
}
```

## Sample Output
For the URL provided in the task, the parser will extract:
```json
{
  "id": "9nXbRoEDdIP_Nra2T9UD2g",
  "pitch": -7.653027784829149,
  "heading": 231.43853022351698,
  "lat": 51.8114178,
  "lng": 19.4684854
}
```

## Parameter Explanations
- **id**: Panorama unique identifier
- **pitch**: Camera pitch angle (-90 to 90 degrees, where 0 is horizontal)
- **heading**: Camera direction (0 to 360 degrees, where 0 is north)
- **lat**: Latitude coordinates
- **lng**: Longitude coordinates

## Notes
- The parser works with most Google Street View URLs
- If parsing fails, check that you have a valid URL
- Error handling is included for invalid URLs