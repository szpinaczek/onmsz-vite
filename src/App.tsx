// import './globals.css'
import './App.css'
import "@fontsource/open-sans"
import '@fontsource/special-elite';
import { ThemeProvider } from "./components/theme-provider"
import Header from './components/header';
import { LanguageProvider, useLanguage } from './components/i18n/language-context';
import { AboutSection } from './components/about-section';
import type { Language } from './components/i18n/translations';

function App({ children }: { children?: React.ReactNode }) {

  const { language, setLanguage } = useLanguage();

  const handleLanguage = (data: Language) => {  
    setLanguage(data)  
  } 

  return (
    <>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
          <div className="min-h-screen">
            <div className="container sm:px-0 mx-auto w-screen max-w-full md:max-w-[95%]">
              {/* Sticky header */}
                  <Header language={language} handleLanguage={handleLanguage}/>
              <div>
                <div className="py-8">
          <div className="mb-8">
            <AboutSection language={language} />
          </div>
              </div>
            </div>
          </div>
          </div>
      </ThemeProvider>

    </>
  )
}

export default App
