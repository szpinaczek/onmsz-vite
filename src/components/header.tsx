import { FlagIcons } from "./flag-icons"
import { getTranslation } from "./i18n/translations"
import { ThemeToggle } from "./theme-toggle"
import { Button } from "./ui/button"
import { useLanguage } from './i18n/language-context';
import type { Language } from './i18n/translations';

interface HeaderProps {
  language: Language;
  handleLanguage: (data: Language) => void;
}

const Header = ({ language, handleLanguage }: HeaderProps) => {
// const { language, setLanguage } = useLanguage();
  return (
    <>
        {/* Sticky header */}
        <div className="sticky top-0 z-49 bg-brown-50 dark:bg-brown-700/80 backdrop-blur-sm border-b border-brown-100 dark:border-brown-700 py-4 px-4">
          <div className="flex flex-col md:flex-row justify-center md:justify-between items-center">
            <h1 className="text-lg font-bold text-primary">
              {getTranslation('title', language)}
            </h1>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-brown-100 dark:bg-brown-500 rounded-lg p-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleLanguage('pl')}
                  className={`h-8 w-8 ${language === 'pl' ? 'bg-brown-100 dark:bg-brown-500' : ''}`}
                >
                  <FlagIcons.pl />
                </Button>
                <Button
                  variant="ghost" 
                  size="icon"
                  onClick={() => handleLanguage('en')}
                  className={`h-8 w-8 ${language === 'en' ? 'bg-brown-100 dark:bg-brown-500' : ''}`}
                >
                  <FlagIcons.en />
                </Button>
              </div>
              <ThemeToggle />
            </div>
          </div>
        </div>
    </>
  )
}

export default Header