import React, { useEffect, useRef, useState } from 'react';
import { useLanguage } from './i18n/language-context';
import { getTranslation } from './i18n/translations';
import { Slider } from './ui/slider';
import { Card, CardContent } from './ui/card';
import { FlickeringGrid } from './ui/shadcn-io/flickering-grid';

// TypeScript definitions for the halftone classes
declare global {
    interface Window {
        BreathingHalftone?: any;
    }
}

interface Vector {
    x: number;
    y: number;
    set(x: number, y: number): void;
    add(v: Vector): void;
    subtract(v: Vector): void;
    scale(s: number): void;
    multiply(v: Vector): void;
    magnitude: number;
}

interface HalftoneOptions {
    dotSize?: number;
    dotSizeThreshold?: number;
    initVelocity?: number;
    oscPeriod?: number;
    oscAmplitude?: number;
    isAdditive?: boolean;
    isRadial?: boolean;
    channels?: string[];
    isChannelLens?: boolean;
    friction?: number;
    hoverDiameter?: number;
    hoverForce?: number;
    activeDiameter?: number;
    activeForce?: number;
}

interface HalftoneSettings {
    dotSize: number;
    oscPeriod: number;
    oscAmplitude: number;
    hoverForce: number;
    activeForce: number;
    friction: number;
    isAdditive: boolean;
    isRadial: boolean;
}

const HeroSection: React.FC = () => {
    const { language } = useLanguage();
    const imgRef = useRef<HTMLImageElement>(null);
    const halftoneRef = useRef<any>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [settings, setSettings] = useState<HalftoneSettings>({
        dotSize: 1 / 210,
        oscPeriod: 2,
        oscAmplitude: 0.2,
        hoverForce: -0.005,
        activeForce: 0.01,
        friction: 0.02,
        isAdditive: false,
        isRadial: false
    });

    // Load the halftone JavaScript files
    useEffect(() => {
        const loadHalftoneScripts = async () => {
            try {
                // Load scripts in order
                const scripts = [
                    '/halftone/vector.js',
                    '/halftone/particle.js',
                    '/halftone/breathing-halftone.js'
                ];

                for (const scriptSrc of scripts) {
                    await new Promise<void>((resolve, reject) => {
                        const script = document.createElement('script');
                        script.src = scriptSrc;
                        script.onload = () => resolve();
                        script.onerror = () => reject(new Error(`Failed to load ${scriptSrc}`));
                        document.head.appendChild(script);
                    });
                }

                setIsLoaded(true);
            } catch (error) {
                console.error('Error loading halftone scripts:', error);
            }
        };

        loadHalftoneScripts();
    }, []);

    // Initialize halftone effect when scripts are loaded and image is ready
    useEffect(() => {
        if (!isLoaded || !imgRef.current || !window.BreathingHalftone) {
            return;
        }

        const initHalftone = () => {
            if (halftoneRef.current) {
                halftoneRef.current.destroy();
            }

            const options: HalftoneOptions = {
                dotSize: settings.dotSize,
                dotSizeThreshold: 0.05,
                initVelocity: 0.02,
                oscPeriod: settings.oscPeriod,
                oscAmplitude: settings.oscAmplitude,
                isAdditive: settings.isAdditive,
                isRadial: settings.isRadial,
                channels: settings.isAdditive ? ['red', 'green', 'blue'] : ['lum'],
                isChannelLens: true,
                friction: settings.friction,
                hoverDiameter: 0.3,
                hoverForce: settings.hoverForce,
                activeDiameter: 0.6,
                activeForce: settings.activeForce
            };

            try {
                halftoneRef.current = new window.BreathingHalftone(imgRef.current, options);
                
                // Style the generated canvas to ensure proper positioning within Hero Section
                setTimeout(() => {
                    if (halftoneRef.current && halftoneRef.current.canvas) {
                        const canvas = halftoneRef.current.canvas;
                        canvas.style.position = 'absolute';
                        canvas.style.top = '0';
                        canvas.style.right = '0';
                        canvas.style.zIndex = '25';
                        canvas.style.pointerEvents = 'auto';
                        canvas.style.mixBlendMode = 'multiply';
                    }
                }, 200);
            } catch (error) {
                console.error('Error creating halftone:', error);
            }
        };

        // Wait for the image to be properly loaded
        const timeout = setTimeout(initHalftone, 500);
        return () => clearTimeout(timeout);
    }, [isLoaded, settings]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (halftoneRef.current) {
                halftoneRef.current.destroy();
            }
        };
    }, []);

    const updateSetting = (key: keyof HalftoneSettings, value: number | boolean) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    // const heroTitle = getTranslation('heroTitle', language);
    const heroSubtitle = getTranslation('heroSubtitle', language);
    const heroSubtitle2 = getTranslation('heroSubtitle2', language); // Add this line = getTranslation('heroSubtitle', language);

    return (
        <>
            <section className="relative overflow-clip bg-brown-100 flex flex-col items-end justify-end max-h-[500px] md:max-h-[400px] lg:max-h-[700px]">

                <FlickeringGrid
                    className="absolute inset-0 z-0"
                    squareSize={4}
                    gridGap={6}
                    flickerChance={0.3}
                    color="rgb(100, 100, 100)"
                    maxOpacity={0.2}
                />
                {/* Title Image */}
                {language === 'pl' ?
                    <div className='absolute top-8 left-10 w-full md:w-[35%] h-auto object-cover z-50'>
                        <img src="/images/title_pl.png" alt="" /></div> :
                    <div className='absolute top-5 left-20 w-full md:w-[25%] h-auto object-cover z-50'>
                        <img src="/images/title_en.png" alt="" /></div>
                }

                <div className="relative z-10">
                    {/* Halftone Container - Positioned absolutely for halftone effect */}
                    <div className="relative top-0 right-0 h-[67vh] md:h-[70vh] lg:h-[75vh] flex items-end justify-end z-20 w-full">
                        <div className="relative w-[60vw] max-w-full md:max-w-[90%] h-auto flex items-end justify-end  mix-blend-multiply">
                            <img
                                ref={imgRef}
                                src="/images/crew.png"
                                alt="Film crew photo"
                                className="w-full h-auto object-cover mix-blend-multiply halftone-source"
                                // style={{
                                //     visibility: 'visible',
                                //     position: 'absolute',
                                //     opacity: 1,
                                //     pointerEvents: 'none'
                                // }}
                                onLoad={() => {
                                    // Trigger effect initialization after image loads
                                    if (isLoaded && window.BreathingHalftone) {
                                        setTimeout(() => {
                                            const event = new Event('resize');
                                            window.dispatchEvent(event);
                                        }, 100);
                                    }
                                }}
                            />
                        </div>
                    </div>
                    
                    {/* Spacer div to maintain layout height */}
                    <div className="h-[67vh] md:h-[70vh] lg:h-[75vh] flex items-end justify-end">
                        <div className="w-[60vw] max-w-full md:max-w-[90%] h-auto"></div>
                    </div>

                    {/* Settings Button */}
                    {/* <button
                onClick={() => setShowSettings(!showSettings)}
                className="absolute top-4 right-4 bg-black/20 hover:bg-black/40 text-white p-3 rounded-full backdrop-blur-sm transition-colors z-10"
                aria-label="Toggle halftone settings"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            </button> */}

                    {/* Settings Panel */}
                    {showSettings && (
                        <Card className="absolute top-16 right-4 w-80 max-w-[calc(100vw-2rem)] bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm z-10">
                            <CardContent className="p-6 space-y-6">
                                <h3 className="font-semibold text-lg">Halftone Settings</h3>

                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium">Dot Size: {(settings.dotSize * 100).toFixed(1)}</label>
                                        <Slider
                                            value={[settings.dotSize * 100]}
                                            onValueChange={([value]) => updateSetting('dotSize', value / 100)}
                                            min={0.5}
                                            max={8}
                                            step={0.1}
                                            className="mt-2"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium">Animation Period: {settings.oscPeriod.toFixed(1)}s</label>
                                        <Slider
                                            value={[settings.oscPeriod]}
                                            onValueChange={([value]) => updateSetting('oscPeriod', value)}
                                            min={1}
                                            max={10}
                                            step={0.1}
                                            className="mt-2"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium">Animation Strength: {(settings.oscAmplitude * 100).toFixed(0)}%</label>
                                        <Slider
                                            value={[settings.oscAmplitude * 100]}
                                            onValueChange={([value]) => updateSetting('oscAmplitude', value / 100)}
                                            min={0}
                                            max={100}
                                            step={5}
                                            className="mt-2"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium">Hover Force: {Math.abs(settings.hoverForce * 100).toFixed(1)}</label>
                                        <Slider
                                            value={[Math.abs(settings.hoverForce * 100)]}
                                            onValueChange={([value]) => updateSetting('hoverForce', -value / 100)}
                                            min={0}
                                            max={10}
                                            step={0.1}
                                            className="mt-2"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium">Click Force: {(settings.activeForce * 100).toFixed(1)}</label>
                                        <Slider
                                            value={[settings.activeForce * 100]}
                                            onValueChange={([value]) => updateSetting('activeForce', value / 100)}
                                            min={0}
                                            max={5}
                                            step={0.1}
                                            className="mt-2"
                                        />
                                    </div>

                                    <div className="flex items-center space-x-3">
                                        <input
                                            type="checkbox"
                                            id="additive"
                                            checked={settings.isAdditive}
                                            onChange={(e) => updateSetting('isAdditive', e.target.checked)}
                                            className="w-4 h-4"
                                        />
                                        <label htmlFor="additive" className="text-sm font-medium">Color Mode</label>
                                    </div>

                                    <div className="flex items-center space-x-3">
                                        <input
                                            type="checkbox"
                                            id="radial"
                                            checked={settings.isRadial}
                                            onChange={(e) => updateSetting('isRadial', e.target.checked)}
                                            className="w-4 h-4"
                                        />
                                        <label htmlFor="radial" className="text-sm font-medium">Radial Grid</label>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Loading State */}
                    {!isLoaded && (
                        <div className="absolute inset-0 bg-brown-100 dark:bg-brown-700 flex items-center justify-center z-30">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brown-300 mx-auto mb-4"></div>
                                {/* <p className="text-gray-600 dark:text-gray-300">Loading halftone effect...</p> */}
                            </div>
                        </div>
                    )}
                </div>

                {/* Instruction text */}
                {/* <div className="absolute bottom-4 left-4 text-white/80 text-sm bg-black/20 backdrop-blur-sm px-3 py-2 rounded">
            Hover and click to interact with the image
        </div> */}
            </section>
        </>
    );
};

export default HeroSection;