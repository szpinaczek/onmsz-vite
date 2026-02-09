import { FlagIcons } from "./flag-icons"
import { getTranslation } from "./i18n/translations"
import { ThemeToggle } from "./theme-toggle"
import { Button } from "./ui/button"
import type { Language } from './i18n/translations';
import { Squash as Hamburger } from 'hamburger-react'
import { useState } from "react"

interface HeaderProps {
  language: Language;
  handleLanguage: (data: Language) => void;
  onToggleStreetView?: () => void;
}

const Header = ({ language, handleLanguage, onToggleStreetView }: HeaderProps) => {
  // const { language, setLanguage } = useLanguage();

  const [isMenuOpen, setMenuOpen] = useState(false)

  return (


    <>
      {/* Sticky header */}
      <div className="sticky top-0 z-1000 bg-brown-50 dark:bg-brown-500 backdrop-blur-sm border-b border-brown-100 dark:border-brown-700 py-4 px-4">
        <div className="flex flex-col md:flex-row justify-center md:justify-between items-center">
          <h1 className="text-sm/4 md:text-lg font-bold text-brown-900 dark:text-brown-100 mb-3 md:mb-0">
            {getTranslation('title', language)}
          </h1>

          {/* Desktop Navigation */}
          <div className="w-full md:w-auto flex flex-row gap-4 items-center justify-between">


            <nav className="hidden md:flex items-center gap-6 ml-8 mr-20">
              <Button
                variant="ghost"
                onClick={() => {
                  const element = document.getElementById('about');
                  element?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="text-brown-900 hover:text-brown-600 hover:bg-brown-100 dark:text-brown-100 dark:hover:text-brown-50 text-sm tracking-wide font-medium cursor-pointer"
              >
                {getTranslation('menuAbout', language)}
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  const element = document.getElementById('video');
                  element?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="text-brown-900 hover:text-brown-600 hover:bg-brown-100 dark:text-brown-100 dark:hover:text-brown-50 text-sm tracking-wide font-medium cursor-pointer"
              >
                {getTranslation('menuFilm', language)}
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  const element = document.getElementById('route-table');
                  element?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="text-brown-900 hover:text-brown-600 hover:bg-brown-100 dark:text-brown-100 dark:hover:text-brown-50 text-sm tracking-wide font-medium cursor-pointer"
              >
                {getTranslation('menuRouteTable', language)}
              </Button>
            </nav>

            {/* Mobile Navigation */}

            <nav className="relative flex items-center md:hidden ml-[-10px] mb-2" onClick={() => setMenuOpen(!isMenuOpen)}>

              <Hamburger size={30} toggled={isMenuOpen} toggle={setMenuOpen} />

              {isMenuOpen && (
                <ul className="absolute top-14 left-0 z-1010 m-0 w-[50vw] flex flex-col gap-2 bg-brown-50 dark:bg-brown-500 backdrop-blur-sm border-b border-brown-100 dark:border-brown-700 pl-4">
                  <li className="mobileMenuItem md:hidden" onClick={() => {
                        const element = document.getElementById('about');
                        element?.scrollIntoView({ behavior: 'smooth' });
                      }}>
                      {getTranslation('menuAbout', language)}
                  </li>
                  <li className="mobileMenuItem md:hidden" onClick={() => {
                        const element = document.getElementById('video');
                        element?.scrollIntoView({ behavior: 'smooth' });
                      }}>
                      {getTranslation('menuFilm', language)}
                  </li>
                  <li className="mobileMenuItem md:hidden" onClick={() => {
                        const element = document.getElementById('route-table');
                        element?.scrollIntoView({ behavior: 'smooth' });
                      }}>
                      {getTranslation('menuRouteTable', language)}
                  </li>
                </ul>
              )}
            </nav>

            {/* Flags and theme toggle */}
            <div className="flex items-center gap-2 ml-auto">
              {/* <Button
                variant="ghost"
                size="icon"
                onClick={onToggleStreetView}
                className="h-8 w-8"
                title={getTranslation('streetView', language)}
              >
                📍
              </Button> */}
              <div className="flex items-center gap-1 bg-brown-100 dark:bg-brown-500 rounded-lg p-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleLanguage('pl')}
                  className={`h-8 w-8 ${language === 'pl' ? 'bg-brown-200 dark:bg-brown-400' : 'bg-brown-100 dark:bg-brown-500'}`}
                >
                  <FlagIcons.pl />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleLanguage('en')}
                  className={`h-8 w-8 ${language === 'en' ? 'bg-brown-200 dark:bg-brown-400' : 'bg-brown-100 dark:bg-brown-500'}`}
                >
                  <FlagIcons.en />
                </Button>
              </div>
              <ThemeToggle />
            </div>

          </div>

        </div>
      </div>
    </>
  )
}

export default Header;


