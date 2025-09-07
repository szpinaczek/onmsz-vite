import { useEffect, useState } from 'react';
import { useLanguage } from './i18n/language-context';
import { getTranslation } from './i18n/translations';
import { FlickeringGrid } from './ui/shadcn-io/flickering-grid';
import { useTheme } from './theme-provider';

const HeroSection: React.FC = () => {
    const { language } = useLanguage();
    const { theme } = useTheme();
    const [appliedTheme, setAppliedTheme] = useState<'light' | 'dark'>('light');

    // Determine the actual applied theme (considering system preference)
    useEffect(() => {
        const updateAppliedTheme = () => {
            let currentTheme = theme;
            if (theme === 'system') {
                currentTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            }
            setAppliedTheme(currentTheme as 'light' | 'dark');
        };

        updateAppliedTheme();

        // Listen for system theme changes
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = () => {
            if (theme === 'system') {
                updateAppliedTheme();
            }
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [theme]);

    // Set FlickeringGrid color based on theme
    const flickeringGridColor = appliedTheme === 'dark' ? 'rgb(220, 211, 204)' : 'rgb(9, 7, 6)';

    // const heroTitle = getTranslation('heroTitle', language);
    const heroSubtitle = getTranslation('heroSubtitle', language);
    const heroSubtitle2 = getTranslation('heroSubtitle2', language); // Add this line = getTranslation('heroSubtitle', language);

    return (
        <>
            <section className="relative overflow-clip bg-brown-100 dark:bg-brown-500 flex flex-col items-end justify-end max-h-[500px] md:max-h-[400px] lg:max-h-[700px]">

                <FlickeringGrid
                    className="absolute inset-0 z-0"
                    squareSize={8}
                    gridGap={6}
                    flickerChance={0.1}
                    color={flickeringGridColor}
                    maxOpacity={0.1}
                />
                {/* Title Image */}
                {language === 'pl' ?
                    <div className='absolute top-8 left-10 w-full md:w-[35%] h-auto object-cover z-50'>
                        <img src="/images/title_pl.png" alt="" /></div> :
                    <div className='absolute top-5 left-20 w-full md:w-[25%] h-auto object-cover z-50'>
                        <img src="/images/title_en.png" alt="" /></div>
                }

                <div>
                    <img src="/images/crew-halftone.png" alt="" className="relative top-0 right-0 w-full h-full object-cover z-0 mix-blend-multiply dark:mix-blend-soft-light max-w-full md:max-w-[40vw]" />
                </div>




            </section>
        </>
    );
};

export default HeroSection;