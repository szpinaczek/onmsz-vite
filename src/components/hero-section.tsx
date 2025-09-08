import { useEffect, useState } from 'react';
import { useLanguage } from './i18n/language-context';
import { getTranslation } from './i18n/translations';
import { FlickeringGrid } from './ui/shadcn-io/flickering-grid';
import { useTheme } from './theme-provider';
import DotPattern from './ui/shadcn-io/dot-pattern';

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
            <section className="relative overflow-clip bg-brown-100 dark:bg-brown-500 flex flex-col items-end justify-end max-h-[500px] md:max-h-[600px] lg:max-h-[700px]">

                <div className='absolute top-0 left-0 w-full h-full inset-shadow-[0_0_150px_rgb(0,0,0,0.3)] dark:inset-shadow-[0_0_150px_rgb(0,0,0,0.8)] z-50 bg-transparent'></div>

                <div className='absolute bottom-0 left-0 w-full h-[33%] bg-gradient-to-b from-brown-200 to-transparent opacity-30 dark:opacity-15 z-10'></div>

                <div className='absolute bottom-0 left-10 w-auto h-[30%] bg-transparent z-12'>
                    <span className='bg-brown-50 dark:bg-brown-600 box-decoration-slice text-brown-600 dark:text-brown-100 text-left font-elite font-bold p-1 text-2xl md:text-lg lg:text-2xl leading-8 lg:leading-10'>
                        {heroSubtitle}<br />{heroSubtitle2}
                    </span>
                </div>

                <FlickeringGrid
                    className="absolute inset-0 z-0"
                    squareSize={8}
                    gridGap={6}
                    flickerChance={0.1}
                    color={flickeringGridColor}
                    maxOpacity={0.1}
                />

                {/* <div className="absolute top-0 left-0 w-full h-full bg-white rounded-lg overflow-hidden z-0">
                    <DotPattern
                        dotSize={2}
                        gap={15}
                        baseColor="#1b1613"
                        activeColor="#b8a698"
                        proximity={120}
                        shockRadius={250}
                        shockStrength={5}
                        resistance={750}
                        returnDuration={1.5}
                    />
                </div> */}

                {/* Title Image */}
                {language === 'pl' ?
                    <div className='absolute top-4 left-1/2 transform -translate-x-1/2 md:-translate-0 md:top-2 lg:top-4 md:left-10 w-[65vw] md:w-[25vw] h-auto object-cover z-50'>
                        <img src="/images/title_pl.png" alt="" /></div> :
                    <div className='absolute top-4 md:top-2 lg:top-3 left-10 w-[80vw] md:w-[35vw] h-auto object-cover z-50'>
                        <img src="/images/title_en.png" alt="" /></div>
                }

                <div>
                    {appliedTheme === 'light' ?
                        <img src="/images/crew-halftone.png" alt="" className="relative w-full h-full object-cover z-11 mix-blend-multiply dark:mix-blend-soft-light max-w-full md:max-w-[40vw] opacity-40 md:opacity-100" /> :
                        <img src="/images/crew-halftone-inverted.png" alt="" className="relative w-full h-full object-cover z-11 mix-blend-normal max-w-full md:max-w-[40vw] opacity-40 md:opacity-100" />
                    }
                    {/* <img src="/images/crew-halftone.png" alt="" className="relative top-0 right-0 w-full h-full object-cover z-0 mix-blend-multiply dark:mix-blend-overlay max-w-full md:max-w-[40vw]" /> */}
                </div>




            </section>
        </>
    );
};

export default HeroSection;