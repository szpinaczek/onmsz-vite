# Synchronizacja Komponentów w React - Podręcznik Programisty

## Spis treści
1. [Wprowadzenie - Problem Synchronizacji](#wprowadzenie)
2. [Architektura State Management](#architektura)
3. [Wzorzec "Lifting State Up"](#lifting-state-up)
4. [Refs i useImperativeHandle](#refs-i-useimperativehandle)
5. [Zapobieganie Cyklicznym Aktualizacjom](#zapobieganie-cyklicznym-aktualizacjom)
6. [Krok po kroku - Implementacja](#implementacja-krok-po-kroku)
7. [Najczęstsze Błędy i Jak Ich Unikać](#najczęstsze-błędy)
8. [Ćwiczenia Praktyczne](#ćwiczenia-praktyczne)

---

## Wprowadzenie - Problem Synchronizacji {#wprowadzenie}

### Czym jest synchronizacja komponentów?

W naszej aplikacji mamy **trzy komponenty**, które muszą ze sobą "rozmawiać":
- 🎥 **VideoPlayer** - odtwarza film
- 🗺️ **MapSection** - pokazuje trasę na mapie  
- 📊 **RouteTable** - wyświetla tabelę z punktami trasy

**Problem:** Gdy użytkownik kliknie punkt na mapie, film powinien skoczyć do odpowiedniego czasu, a tabela powinna przewinąć się do odpowiedniego wiersza.

### Analogia ze świata rzeczywistego

Wyobraź sobie **orkiestrę**:
- Dyrygent (App.tsx) daje znak
- Wszystkie instrumenty (komponenty) muszą grać w tym samym tempie
- Jeśli skrzypce zaczynają szybciej, reszta musi nadążyć

W programowaniu nazywamy to **synchronizacją stanu**.

---

## Architektura State Management {#architektura}

### Dlaczego nie możemy po prostu "przekazać" danych między komponentami?

❌ **Złe podejście:**
```javascript
// VideoPlayer próbuje bezpośrednio mówić do MapSection
<VideoPlayer onTimeChange={(time) => mapComponent.updateTime(time)} />
```

**Problemy:**
- Komponenty są zbyt zależne od siebie
- Trudno testować
- Kod staje się spagettiowy

✅ **Dobre podejście - Centralne zarządzanie stanem:**

```javascript
// App.tsx - "Centrum dowodzenia"
const [currentTime, setCurrentTime] = useState(0);

// Każdy komponent dostaje dane i funkcję do aktualizacji
<VideoPlayer currentTime={currentTime} onTimeUpdate={setCurrentTime} />
<MapSection currentTime={currentTime} onTimeUpdate={setCurrentTime} />
<RouteTable currentTime={currentTime} onTimeUpdate={setCurrentTime} />
```

### Schemat przepływu danych

```
                    App.tsx (currentTime state)
                           ↙️    ↓    ↘️
               VideoPlayer    MapSection    RouteTable
                    ↘️           ↓           ↙️
                      onTimeUpdate(newTime)
                           ↗️    ↑    ↖️
                    App.tsx (setCurrentTime)
```

---

## Wzorzec "Lifting State Up" {#lifting-state-up}

### Co to znaczy?

**"Lifting State Up"** = Przenieś stan do wspólnego rodzica komponentów, które muszą się synchronizować.

### Implementacja w naszej aplikacji

```javascript
// App.tsx
function App() {
  // ✅ Stan jest tutaj - w wspólnym rodzicu
  const [currentTime, setCurrentTime] = useState(0);
  
  // ✅ Funkcje do zarządzania synchronizacją
  const handleTimeUpdate = (time) => {
    if (!isMapUpdating.current) {
      setCurrentTime(time);
      // Aktualizuj mapę
    }
  };

  const handleMapTimeUpdate = (time) => {
    if (!isVideoUpdating.current) {
      setCurrentTime(time);
      // Aktualizuj video
    }
  };

  return (
    <>
      <VideoPlayer 
        onTimeUpdate={handleTimeUpdate}
        onFrameChange={handleTimeUpdate}
      />
      <MapComponent 
        currentTime={currentTime}
        onTimeUpdate={handleMapTimeUpdate}
      />
      <RouteTable 
        currentTime={currentTime}
        // Tabela tylko odbiera, nie wysyła
      />
    </>
  );
}
```

### Dlaczego to działa?

1. **Jeden źródło prawdy** - `currentTime` jest w jednym miejscu
2. **Jednokierunkowy przepływ** - dane idą w dół, eventy w górę
3. **Kontrola** - App.tsx decyduje kto i kiedy może aktualizować stan

---

## Refs i useImperativeHandle {#refs-i-useimperativehandle}

### Problem: Jak wywołać funkcję w dziecku z rodzica?

Czasami potrzebujemy wywołać funkcję w komponencie dziecku z komponentu rodzica. Na przykład: "VideoPlayer, przewiń do czasu 120 sekund!"

### Stare podejście (Class Components)

```javascript
// ❌ Stary sposób - class components
class VideoPlayer extends Component {
  seekTo(time) {
    this.videoRef.current.currentTime = time;
  }
}

// W rodzicu
this.videoPlayerRef.current.seekTo(120);
```

### Nowe podejście - useImperativeHandle

```javascript
// ✅ Nowoczesny sposób - hooks
const VideoPlayer = forwardRef((props, ref) => {
  const videoRef = useRef();

  // "Eksportujemy" funkcje, które rodzic może wywołać
  useImperativeHandle(ref, () => ({
    seekVideo: (time) => {
      videoRef.current.currentTime = time;
    },
    pauseVideo: () => {
      videoRef.current.pause();
    },
    // Można też eksportować gettery
    get currentTime() {
      return videoRef.current?.currentTime || 0;
    }
  }));

  return <video ref={videoRef} />;
});

// W App.tsx
const videoPlayerRef = useRef();

const jumpToTime = (time) => {
  // Wywołujemy funkcję z dziecka!
  videoPlayerRef.current?.seekVideo(time);
};

return <VideoPlayer ref={videoPlayerRef} />;
```

### Kluczowe pojęcia

- **forwardRef** - pozwala komponentowi funkcyjnemu przyjmować ref
- **useImperativeHandle** - definiuje jakie funkcje są dostępne przez ref
- **ref** - referencja do instancji komponentu

---

## Zapobieganie Cyklicznym Aktualizacjom {#zapobieganie-cyklicznym-aktualizacjom}

### Problem: Nieskończone pętle

Wyobraź sobie sytuację:
1. Video aktualizuje czas → Map się aktualizuje
2. Map aktualizuje czas → Video się aktualizuje  
3. Video aktualizuje czas → Map się aktualizuje
4. I tak w kółko... 💀

### Rozwiązanie: Flagi synchronizacji

```javascript
// App.tsx
const isMapUpdating = useRef(false);
const isVideoUpdating = useRef(false);

const handleTimeUpdate = (time) => {
  // ✅ Sprawdź czy mapa właśnie aktualizuje
  if (!isMapUpdating.current) {
    isVideoUpdating.current = true; // Ustaw flagę
    setCurrentTime(time);
    
    if (mapRef.current) {
      mapRef.current.seekToTime(time);
    }
    
    // Reset flagi z opóźnieniem
    setTimeout(() => {
      isVideoUpdating.current = false;
    }, 50);
  }
};

const handleMapTimeUpdate = (time) => {
  // ✅ Sprawdź czy video właśnie aktualizuje
  if (!isVideoUpdating.current) {
    isMapUpdating.current = true; // Ustaw flagę
    setCurrentTime(time);
    
    if (videoPlayerRef.current) {
      videoPlayerRef.current.seekVideo(time);
    }
    
    // Reset flagi z opóźnieniem
    setTimeout(() => {
      isMapUpdating.current = false;
    }, 50);
  }
};
```

### Dlaczego useRef a nie useState?

```javascript
// ❌ Złe - useState spowoduje re-render
const [isUpdating, setIsUpdating] = useState(false);

// ✅ Dobre - useRef nie powoduje re-render
const isUpdating = useRef(false);
```

**useRef** to jak "zmienna globalna" w komponencie - zmiana wartości nie powoduje ponownego renderowania.

---

## Implementacja Krok po Kroku {#implementacja-krok-po-kroku}

### Krok 1: Utwórz centralny stan

```javascript
// App.tsx
function App() {
  const [currentTime, setCurrentTime] = useState(0);
  const [keyFrames, setKeyFrames] = useState([]);
  
  // Refs do komunikacji z dziećmi
  const videoPlayerRef = useRef();
  const mapRef = useRef();
  
  // Flagi synchronizacji
  const isMapUpdating = useRef(false);
  const isVideoUpdating = useRef(false);
```

### Krok 2: Załaduj dane

```javascript
  useEffect(() => {
    const loadFramesData = async () => {
      try {
        const response = await fetch('/frames.json');
        const data = await response.json();
        
        // Przelicz odległości między punktami
        const framesWithDistances = data.frames.map((frame, index) => {
          // ... obliczenia odległości
          return { ...frame, distance, totalDistance };
        });
        
        setKeyFrames(framesWithDistances);
      } catch (error) {
        console.error('Błąd ładowania danych:', error);
      }
    };
    
    loadFramesData();
  }, []);
```

### Krok 3: Utwórz handlery synchronizacji

```javascript
  const handleTimeUpdate = (time) => {
    if (!isMapUpdating.current) {
      isVideoUpdating.current = true;
      setCurrentTime(time);
      
      if (mapRef.current) {
        mapRef.current.seekToTime(time);
      }
      
      setTimeout(() => {
        isVideoUpdating.current = false;
      }, 50);
    }
  };

  const handleMapTimeUpdate = (time) => {
    if (!isVideoUpdating.current) {
      isMapUpdating.current = true;
      setCurrentTime(time);
      
      if (videoPlayerRef.current) {
        videoPlayerRef.current.seekVideo(time);
      }
      
      setTimeout(() => {
        isMapUpdating.current = false;
      }, 50);
    }
  };
```

### Krok 4: Podłącz komponenty

```javascript
  return (
    <div>
      <VideoPlayer
        ref={videoPlayerRef}
        onTimeUpdate={handleTimeUpdate}
        onFrameChange={handleTimeUpdate}
        language={language}
      />
      
      <MapComponent
        ref={mapRef}
        currentTime={currentTime}
        onTimeUpdate={handleMapTimeUpdate}
        language={language}
      />
      
      <RouteTable
        keyFrames={keyFrames}
        currentTime={currentTime}
        videoPlayerRef={videoPlayerRef} // Do bezpośrednich wywołań
        language={language}
      />
    </div>
  );
```

### Krok 5: Implementuj logikę w dzieciach

#### VideoPlayer:

```javascript
const VideoPlayer = forwardRef(({ onTimeUpdate, onFrameChange }, ref) => {
  const videoRef = useRef();
  const [currentTime, setCurrentTime] = useState(0);

  // Eksportuj funkcje dla rodzica
  useImperativeHandle(ref, () => ({
    seekVideo: (time) => {
      if (videoRef.current) {
        videoRef.current.currentTime = time;
      }
    },
    pauseVideo: () => videoRef.current?.pause(),
    playVideo: () => videoRef.current?.play()
  }));

  // Handler aktualizacji czasu
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const time = videoRef.current.currentTime;
      setCurrentTime(time);
      
      // Powiadom rodzica
      if (onTimeUpdate) {
        onTimeUpdate(time);
      }
    }
  };

  return (
    <video
      ref={videoRef}
      onTimeUpdate={handleTimeUpdate}
      // ... inne props
    />
  );
});
```

#### RouteTable z automatycznym przewijaniem:

```javascript
function RouteTable({ keyFrames, currentTime, videoPlayerRef }) {
  const scrollViewportRef = useRef();
  const rowRefs = useRef([]);
  const lastScrolledIndexRef = useRef(-1);

  // Automatyczne przewijanie przy zmianie czasu
  useEffect(() => {
    if (keyFrames.length === 0) return;

    // Znajdź aktualny indeks ramki
    let currentFrameIndex = -1;
    for (let i = 0; i < keyFrames.length; i++) {
      if (currentTime >= keyFrames[i].time && 
          (i === keyFrames.length - 1 || currentTime < keyFrames[i + 1].time)) {
        currentFrameIndex = i;
        break;
      }
    }

    // Przewiń tylko jeśli się zmienił
    if (currentFrameIndex !== -1 && currentFrameIndex !== lastScrolledIndexRef.current) {
      lastScrolledIndexRef.current = currentFrameIndex;
      scrollToRow(currentFrameIndex);
    }
  }, [currentTime, keyFrames]);

  const scrollToRow = (index) => {
    if (scrollViewportRef.current && rowRefs.current[index]) {
      scrollViewportRef.current.scrollTo({
        top: rowRefs.current[index].offsetTop,
        behavior: 'smooth'
      });
    }
  };

  // Handler kliknięcia przycisku "Przejdź"
  const handleJumpTo = (frameTime, index) => {
    if (videoPlayerRef.current) {
      videoPlayerRef.current.seekVideo(frameTime);
      scrollToRow(index);
    }
  };

  return (
    <div ref={scrollViewportRef}>
      {keyFrames.map((frame, index) => (
        <div 
          key={index}
          ref={(el) => rowRefs.current[index] = el}
          className={currentFrameIndex === index ? 'highlighted' : ''}
        >
          {frame.description}
          <button onClick={() => handleJumpTo(frame.time, index)}>
            Przejdź
          </button>
        </div>
      ))}
    </div>
  );
}
```

---

## Najczęstsze Błędy i Jak Ich Unikać {#najczęstsze-błędy}

### 1. ❌ Zapominanie o dependencies w useEffect

```javascript
// ❌ Źle - nieskończone re-rendery
useEffect(() => {
  updateSomething();
}); // Brak tablicy dependencies!

// ✅ Dobrze
useEffect(() => {
  updateSomething();
}, [dependency1, dependency2]);
```

### 2. ❌ Używanie useState do flag synchronizacji

```javascript
// ❌ Źle - powoduje niepotrzebne re-rendery
const [isUpdating, setIsUpdating] = useState(false);

// ✅ Dobrze
const isUpdating = useRef(false);
```

### 3. ❌ Bezpośrednie wywoływanie setState w renderze

```javascript
// ❌ Źle - nieskończona pętla
function Component({ currentTime }) {
  if (currentTime > 100) {
    setCurrentTime(0); // ❌ NIGDY tego nie rób!
  }
  
  return <div>Time: {currentTime}</div>;
}

// ✅ Dobrze - użyj useEffect
function Component({ currentTime }) {
  useEffect(() => {
    if (currentTime > 100) {
      setCurrentTime(0);
    }
  }, [currentTime]);
  
  return <div>Time: {currentTime}</div>;
}
```

### 4. ❌ Nieprawidłowe używanie refs

```javascript
// ❌ Źle - ref może być null
const handleClick = () => {
  myRef.current.doSomething(); // Crash jeśli ref jest null!
};

// ✅ Dobrze - sprawdź czy ref istnieje
const handleClick = () => {
  if (myRef.current) {
    myRef.current.doSomething();
  }
  // LUB
  myRef.current?.doSomething(); // Optional chaining
};
```

### 5. ❌ Race Conditions w asynchronicznych operacjach

```javascript
// ❌ Źle - mogą być problemy z race conditions
const handleAsyncUpdate = async (time) => {
  const data = await fetchData(time);
  setCurrentTime(data.time); // Co jeśli użytkownik już kliknął coś innego?
};

// ✅ Dobrze - użyj cleanup lub flagi
const handleAsyncUpdate = async (time) => {
  const startTime = Date.now();
  const data = await fetchData(time);
  
  // Sprawdź czy to nadal aktualna operacja
  if (Date.now() - startTime < 1000) { // Timeout 1s
    setCurrentTime(data.time);
  }
};
```

---

## Ćwiczenia Praktyczne {#ćwiczenia-praktyczne}

### Ćwiczenie 1: Dodaj nowy komponent synchronizowany

**Zadanie:** Stwórz komponent `TimeDisplay`, który pokazuje aktualny czas w formacie MM:SS i jest zsynchronizowany z resztą aplikacji.

```javascript
// Twój kod tutaj:
function TimeDisplay({ currentTime }) {
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="time-display">
      {formatTime(currentTime)}
    </div>
  );
}

// Gdzie go umieścisz w App.tsx?
// Jak go podłączysz do synchronizacji?
```

### Ćwiczenie 2: Debugging synchronizacji

**Zadanie:** Komponent nie synchronizuje się. Znajdź błąd:

```javascript
// ❌ Ten kod nie działa - znajdź błędy
function BrokenComponent({ currentTime, onTimeUpdate }) {
  const [localTime, setLocalTime] = useState(0);
  
  // Błąd #1: Gdzie jest problem?
  useEffect(() => {
    setLocalTime(currentTime);
  });
  
  const handleClick = (newTime) => {
    setLocalTime(newTime);
    // Błąd #2: Co tu brakuje?
  };
  
  return (
    <button onClick={() => handleClick(100)}>
      Jump to 100s (Current: {localTime})
    </button>
  );
}
```

**Odpowiedzi:**
1. Brak dependencies w useEffect powoduje nieskończone re-rendery
2. Nie wywołuje `onTimeUpdate(newTime)` aby powiadomić rodzica

### Ćwiczenie 3: Optymalizacja wydajności

**Zadanie:** Ten komponent re-renderuje się za często. Jak go zoptymalizować?

```javascript
// ❌ Nieoptymalne
function ExpensiveComponent({ currentTime, data, onUpdate }) {
  const processedData = data.map(item => ({
    ...item,
    processed: expensiveCalculation(item, currentTime)
  }));
  
  return (
    <div>
      {processedData.map(item => (
        <div key={item.id} onClick={() => onUpdate(item.time)}>
          {item.processed}
        </div>
      ))}
    </div>
  );
}
```

**Rozwiązania do zastanowienia:**
- `useMemo` dla `processedData`
- `React.memo` dla całego komponentu
- `useCallback` dla `onUpdate`

---

## Podsumowanie - Kluczowe Wzorce

### 1. **Lifting State Up**
Przenieś stan do wspólnego rodzica komponentów, które muszą być synchronizowane.

### 2. **Single Source of Truth**
Jeden komponent (App.tsx) zarządza stanem, inne tylko go odbierają i wysyłają eventy.

### 3. **Refs + useImperativeHandle**
Do bezpośredniego wywoływania funkcji w komponentach dzieci.

### 4. **Flagi synchronizacji**
Użyj `useRef` do zapobiegania cyklicznym aktualizacjom.

### 5. **Effect cleanup**
Zawsze myśl o czyszczeniu efektów i timeout'ów.

### Pamietaj:
- **Props w dół, eventy w górę** - podstawowa reguła React
- **useRef dla wartości, które nie powinny powodować re-render**
- **Zawsze sprawdzaj czy refs nie są null przed użyciem**
- **Debuguj krok po kroku - dodaj console.log w kluczowych miejscach**

Powodzenia w implementacji własnych synchronizowanych komponentów! 🚀