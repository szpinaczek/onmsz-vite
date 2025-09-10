# Interaktywna Podróż Śladami Filmu - Dokumentacja Funkcjonalności

## Opis Ogólny

Aplikacja to interaktywna podróż śladami eksperymentalnego filmu z 1975 roku "Oj! Nie mogę się zatrzymać". Umożliwia użytkownikom śledzenie trasy przebytej przez bohaterów filmu poprzez zsynchronizowane komponenty: odtwarzacz wideo, mapę interaktywną oraz tabelę informacji o trasie.

## Architektura Komponentów

### 1. Odtwarzacz Wideo (`VideoPlayer`)
**Lokalizacja:** `src/components/video-player.tsx`

#### Główne Funkcje:
- **Odtwarzanie filmu** z kontrolkami (play/pause, przewijanie, wyciszanie)
- **Slider czasowy** z kluczowymi punktami (key frames) oznaczonymi jako klikalne markery
- **Tryb pełnoekranowy** z osobnymi kontrolkami
- **Klawiatura shortcuts**: 
  - Spacja: play/pause
  - Strzałki: przewijanie klatka po klatce
  - F: pełny ekran
  - M: wyciszenie

#### Kluczowe Features:
- **Key Frame Markers**: Pionowe linie na sliderze czasu oznaczające ważne punkty trasy
- **Tooltips**: Pokazują opis lokalizacji i czas dla każdego key frame
- **Info Tooltip**: Wyświetla dodatkowe informacje o bieżącym punkcie trasy
- **Smooth Seeking**: Płynne przewijanie do wybranego czasu

### 2. Mapa Interaktywna (`MapSection`)
**Lokalizacja:** `src/components/map-section.tsx`

#### Główne Funkcje:
- **Wyświetlanie trasy** jako różowej linii łączącej wszystkie punkty
- **Key Frame Markers**: Różowe kropki na trasie oznaczające kluczowe punkty
- **Aktualny marker pozycji**: Czerwony marker pokazujący bieżącą pozycję na trasie
- **Interpolacja pozycji**: Płynne przesuwanie markera między punktami kluczowymi

#### Interakcje:
- **Klik na trasę**: Przewija film do najbliższego punktu kluczowego
- **Klik na key frame marker**: Przewija film do dokładnego czasu tego punktu
- **Automatyczne śledzenie**: Mapa automatycznie przesuwa się, gdy marker zbliża się do krawędzi
- **Przycisk Reset**: Powrót do widoku całej trasy

#### Warstwy Map:
- **Standardowa mapa**: OpenStreetMap
- **Mapa satelitarna**: Esri World Imagery
- **Tryb ciemny**: Automatyczne filtrowanie kolorów mapy

### 3. Tabela Informacji o Trasie (`RouteTable`)
**Lokalizacja:** `src/components/route-table.tsx`

#### Struktura Danych:
- **Czas**: Moment w filmie (MM:SS)
- **Lokalizacja**: Nazwa miejsca/ulicy
- **Współrzędne**: Szerokość i długość geograficzna
- **Odległość**: Dystans od początku trasy
- **Przycisk "Przejdź"**: Szybki skok do danego punktu

#### Features:
- **Automatyczne przewijanie**: Tabela automatycznie przewija się do aktualnego wiersza
- **Podświetlenie aktualnego wiersza**: Różowe tło dla bieżącego punktu trasy
- **Mini wykres postępu**: Wizualne przedstawienie postępu trasy
- **Responsywność**: Ukrywanie niektórych kolumn na mniejszych ekranach

## Synchronizacja Komponentów

### Przepływ Danych

```
frames.json → App.tsx → {VideoPlayer, MapSection, RouteTable}
                ↓
            currentTime state
                ↓
        Synchronizacja wszystkich komponentów
```

### Mechanizmy Synchronizacji

#### 1. **Video → Mapa i Tabela**
```typescript
const handleTimeUpdate = (time: number) => {
  if (!isMapUpdating.current) {
    isVideoUpdating.current = true;
    setCurrentTime(time);
    if (mapRef.current) {
      mapRef.current.seekToTime(time);
    }
    // Tabela automatycznie reaguje na zmiany currentTime
  }
};
```

#### 2. **Mapa → Video i Tabela**
```typescript
const handleMapTimeUpdate = (time: number) => {
  if (!isVideoUpdating.current) {
    isMapUpdating.current = true;
    setCurrentTime(time);
    if (videoPlayerRef.current) {
      videoPlayerRef.current.seekVideo(time);
    }
  }
};
```

#### 3. **Tabela → Video i Mapa**
- Przycisk "Przejdź" wywołuje `videoPlayerRef.current.seekVideo(frame.time)`
- Automatycznie przewija tabelę do wybranego wiersza
- Przewija stronę do sekcji wideo

### Zapobieganie Cyklicznym Aktualizacjom

System wykorzystuje flagi `isVideoUpdating` i `isMapUpdating` z timeout'ami, aby zapobiec nieskończonym pętlom aktualizacji między komponentami.

## Struktura Danych

### Format `frames.json`
```json
{
  "frames": [
    {
      "time": 11,
      "lat": 51.8086928,
      "lng": 19.4710456,
      "description": {
        "pl": "Arturówek, początek trasy",
        "en": "Arturówek, route start"
      },
      "info": {
        "pl": "Dodatkowe informacje...",
        "en": "Additional information..."
      }
    }
  ],
  "route": [[lat, lng], ...]
}
```

### Obliczone Pola
- **distance**: Odległość do poprzedniego punktu (w metrach)
- **totalDistance**: Całkowita odległość od początku trasy

## Funkcje Techniczne

### Interpolacja Pozycji
Aplikacja oblicza pozycję markera między kluczowymi punktami używając interpolacji liniowej:

```typescript
const calculateInterpolatedPosition = (time: number, frames: FrameData[]) => {
  // Znajdź ramki przed i po bieżącym czasie
  // Oblicz postęp między nimi (0-1)
  // Interpoluj współrzędne geograficzne
};
```

### Automatyczne Przewijanie Tabeli
```typescript
useEffect(() => {
  // Znajdź aktualny indeks ramki na podstawie currentTime
  // Przewiń do odpowiedniego wiersza jeśli się zmienił
  if (currentFrameIndex !== lastScrolledIndexRef.current) {
    scrollToRow(currentFrameIndex, 'smooth');
  }
}, [currentTime, keyFrames]);
```

### Responsywność
- **Desktop**: Wszystkie komponenty widoczne jednocześnie
- **Tablet**: Mapa pod filmem, pełna tabela
- **Mobile**: Ukryte niektóre kolumny tabeli, kompaktowe kontrolki

## Lokalizacja

Aplikacja obsługuje dwa języki:
- **Polski (pl)**: Domyślny język
- **Angielski (en)**: Tłumaczenia dla wszystkich tekstów

Przełączanie języka odbywa się poprzez flagę w prawym górnym rogu.

## Optymalizacje Wydajności

1. **Throttling aktualizacji**: Ograniczenie częstości aktualizacji pozycji na mapie
2. **Memo komponentów**: Zapobieganie niepotrzebnym re-renderom
3. **Lazy loading**: Komponenty ładowane na żądanie
4. **Debouncing**: Ograniczenie częstości wywołań podczas interakcji z suwakiem

## Funkcje Dodatkowe

### Tryb Ciemny
Aplikacja automatycznie dostosowuje się do preferencji systemowych lub pozwala na ręczne przełączanie.

### Dostępność
- **Keyboard Navigation**: Pełna obsługa klawiatury
- **Screen Readers**: Odpowiednie etykiety ARIA
- **Focus Management**: Logiczne przemieszczanie focus'u

### Error Handling
- Graceful degradation przy braku danych
- Fallback dla nieobsługiwanych przeglądarek
- Toast notifications dla błędów

## Testowanie Synchronizacji

Aby przetestować czy synchronizacja działa prawidłowo:

1. **Test odtwarzacza**: Puść film i obserwuj czy marker na mapie i tabela się aktualizują
2. **Test mapy**: Kliknij punkt na trasie i sprawdź czy film skacze do odpowiedniego czasu
3. **Test tabeli**: Użyj przycisków "Przejdź" i sprawdź synchronizację
4. **Test key frames**: Kliknij markery na sliderze wideo

Wszystkie te interakcje powinny powodować płynną synchronizację wszystkich komponentów bez opóźnień czy błędów.