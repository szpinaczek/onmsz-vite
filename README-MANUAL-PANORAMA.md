# Jak ręcznie dodać fotosferę (panoramę) z Google Maps

Aby ręcznie dodać konkretną panoramę Google Street View zamiast domyślnej, potrzebujesz:
1. Pobrać parametery panoramy z URL Google Maps
2. Dodać je do pliku `public/frames.json` w odpowiednim miejscu

## Krok 1: Pobierz URL panoramy z Google Maps

1. Otwórz [Google Maps](https://www.google.pl/maps)
2. Znajdź miejsce, dla którego chcesz dodać panoramę
3. Kliknij na ikonę Street View (malutki człowiek) lub wybierz "Zobacz panoramę"
4. Skopiuj URL z paska przeglądarki

Przykładowy URL:
```
https://www.google.com/maps/@51.8114178,19.4684854,3a,75y,231.44h,97.65t/data=!3m7!1e1!3m5!1s9nXbRoEDdIP_Nra2T9UD2g!2e0!6shttps:%2F%2Fstreetviewpixels-pa.googleapis.com%2Fv1%2Fthumbnail%3Fcb_client%3Dmaps_sv.tactile%26w%3D900%26h%3D600%26pitch%3D-7.653027784829149%26panoid%3D9nXbRoEDdIP_Nra2T9UD2g%26yaw%3D231.43853022351698!7i13312!8i6656?entry=ttu&g_ep=EgoyMDI2MDIwMS4wIKXMDSoASAFQAw%3D%3D
```

## Krok 2: Wyekstrahuj parametry panoramy

Użyj jednego z dostępnych parserów, aby wyciągnąć niezbędne parametry:

### Opcja A: Parser w przeglądarce (najprostsza)
1. Otwórz plik `streetview-parser-console.html` w przeglądarce
2. Wklej URL i kliknij "Extract Parameters"
3. Skopiuj wynik w formacie JSON

### Opcja B: Parser w konsoli Node.js
```bash
node streetview-parser.mjs "TWÓJ_URL"
```

### Opcja C: Parser TypeScript (dla programistów)
```typescript
import { extractStreetViewParams } from '@/lib/utils';
const params = extractStreetViewParams('TWÓJ_URL');
console.log(params);
```

## Krok 3: Dodaj panoramę do pliku frames.json

Otwórz plik `public/frames.json` i znajdź klatkę (frame), dla której chcesz dodać panoramę. Dodaj właściwość `manualPanorama` w formacie:

```json
{
  "time": 11,
  "lat": 51.8086928,
  "lng": 19.4710456,
  "description": {
    "pl": "Arturówek, początek trasy",
    "en": "Arturówek, route start"
  },
  "info": {
    "pl": "Zaczynamy w brzozowym lasku w dzielnicy Arturówek...",
    "en": "We start in a birch grove in the Arturówek district..."
  },
  "manualPanorama": {
    "type": "panoId",
    "panoId": "9nXbRoEDdIP_Nra2T9UD2g",
    "heading": 231.44,
    "pitch": -7.65,
    "zoom": 0.41
  }
}
```

### Właściwości manualPanorama:
- **type**: Always "panoId" for Google Street View panoramas
- **panoId**: Unikalny identyfikator panoramy (np. "9nXbRoEDdIP_Nra2T9UD2g")
- **heading**: Kierunek widoku w stopniach (0 = północ, 90 = wschód, 180 = południe, 270 = zachód)
- **pitch**: Kąt nachylenia kamery w stopniach (-90 = dół, 0 = poziomo, 90 = góra)
- **zoom**: Poziom przybliżenia (0.0 = najdalszy, 1.0 = najbliższy) - opcjonalne

## Krok 4: Testuj zmianę

1. Upewnij się, że serwer deweloperski działa (`npm run dev`)
2. Odśwież stronę w przeglądarce
3. Przewiń do czasu, dla którego dodałeś panoramę
4. Sprawdź, czy wyświetla się poprawna panorama

## Przykładowa konfiguracja z wyekstrahowanymi parametrami

Dla przykładowego URL z początku:
```json
{
  "time": 11,
  "lat": 51.8114178,
  "lng": 19.4684854,
  "description": {
    "pl": "Miejsce z niestandardową panoramą",
    "en": "Location with custom panorama"
  },
  "manualPanorama": {
    "type": "panoId",
    "panoId": "9nXbRoEDdIP_Nra2T9UD2g",
    "heading": 231.44,
    "pitch": -7.65,
    "zoom": 0.41
  }
}
```

## Dodatkowe informacje

1. Możesz dodawać niestandardowe panoramy do dowolnej klatki w pliku frames.json
2. Aby usunąć niestandardową panoramę, po prostu usuń właściwość `manualPanorama` z klatki
3. Aplikacja automatycznie przełączy się między domyślnym widokiem Street View a niestandardową panoramą w zależności od czasu wideo
4. Właściwość `customImage` pozwala na użycie własnych 360-stopniowych zdjęć (np. z GoPro Fusion lub podobnego aparatu)

## Troubleshooting

- Jeśli panorama nie się wyświetla, sprawdź:
  - Czy `panoId` jest poprawny
  - Czy `heading` i `pitch` są w prawidłowych zakresach
  - Czy URL Google Maps był prawidłowy
  - Czy nie ma błędów w konsoli przeglądarki (F12 -> Konsola)