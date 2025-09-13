import { Dialog, DialogTrigger, DialogContent, DialogTitle } from "./ui/dialog";
import { ScrollArea } from "./ui/scroll-area";
import { Bookmark, MapPin, Calendar, Film, User, Camera, Clock, Award, CalendarX, GraduationCap, Clapperboard, Trophy, Fingerprint, Baby, Building2, CalendarCheck } from "lucide-react";
import type { Language } from "./i18n/translations";
import { getTranslation } from "./i18n/translations";
import { Button } from "./ui/button";
import { DialogHeader } from "./ui/dialog";
import { Table, TableBody, TableRow, TableCell } from "./ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import GlowingCard from "./glowing-card";
import InfoCard from "./info-card";

// import { useTheme } from "next-themes";


interface AboutSectionProps {
  language: Language;
}

export function AboutSection({ language }: AboutSectionProps) {
  // const { theme } = useTheme();

  return (
    <div className="w-full flex flex-col lg:flex-row justify-between gap-6 p-0 m-0 border-0">
      <GlowingCard>
        <CardHeader className="border-b border-brown-200 dark:border-brown-600">
          <CardTitle className="text-2xl font-bold tracking-tight text-brown-900 dark:text-brown-100 flex items-center gap-2">
            <Bookmark className="size-6 text-brown-700 dark:text-brown-300" />
            <h3>
              {getTranslation('about', language)}
            </h3>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-6">

              {/* Main content with formatting */}
              <div className="space-y-4">
                <p className="text-md text-brown-900 dark:text-brown-100 leading-relaxed">
                  {getTranslation('aboutApp', language).split('\n\n').map((paragraph, index) => (
                    <span key={index}>
                      {paragraph}
                      {index < getTranslation('aboutApp', language).split('\n\n').length - 1 && (
                        <>
                          <br /><br />
                        </>
                      )}
                    </span>
                  ))}
                </p>
              </div>

              <div className="flex flex-wrap gap-5 mt-4 justify-center md:justify-start">
                <Button variant="outline" className="text-brown-700 dark:text-brown-100 border-brown-300 dark:border-brown-600 hover:bg-brown-100 dark:hover:bg-brown-700"
                  onClick={() => window.open('https://www.filmpolski.pl/fp/index.php?film=422453', '_blank')}>
                  <Film className="mr-2 h-4 w-4" />
                  {language === "pl" ? 'Film Polski' : 'Polish Film Database'}
                </Button>

                <Button variant="outline" className="text-brown-700 dark:text-brown-100 border-brown-300 dark:border-brown-600 hover:bg-brown-100 dark:hover:bg-brown-700"
                  onClick={() => { language === "pl" ? window.open('https://culture.pl/pl/tworca/zbigniew-rybczynski', '_blank') : window.open('https://culture.pl/en/artist/zbigniew-rybczynski', '_blank') }}>
                  <User className="mr-2 h-4 w-4" />
                  {language === "pl" ? 'O reżyserze' : 'About the Director'}
                </Button>

                <Button variant="outline" className="text-brown-700 dark:text-brown-50 border-brown-300 dark:border-brown-600 hover:bg-brown-100 dark:hover:bg-brown-700"
                  onClick={() => window.open('https://fototeka.fn.org.pl/pl/filmy/info/11199/oj-nie-moge-sie-zatrzymac.html', '_blank')}>
                  <Camera className="mr-2 h-4 w-4" />
                  {language === "pl" ? 'Zdjęcia z planu filmowego' : 'Film Production Photos'}
                </Button>
              </div>

              {/* Separator with quote */}
              {/* <div className="py-4">
                <Separator className="my-4" />
                <p className="text-center text-brown-600 dark:text-brown-400 italic text-sm">
                  {language === "pl" 
                    ? '"Film to nie tylko obraz i dźwięk, to podróż przez czas i przestrzeń."' 
                    : '"Film is not just image and sound, it\'s a journey through time and space."'}
                </p>
                <Separator className="my-4" />
              </div> */}
            </div>
          </ScrollArea>
        </CardContent>
      </GlowingCard>

      <GlowingCard>
        <CardHeader className="border-b border-brown-200/30 dark:border-brown-600">
          <CardTitle className="text-2xl font-bold tracking-tight text-brown-900 dark:text-brown-100 flex items-center gap-2">
            <Film className="h-6 w-6" />
            <h3>
              {getTranslation('aboutMovie', language)}
            </h3>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <Tabs defaultValue="film" className="w-full">
            <TabsList className="mb-8 bg-brown-200/30 dark:bg-brown-700 p-1 rounded-xl">
              <TabsTrigger
                value="film"
                className="tabs-trigger"
              >
                <Film className="h-4 w-4" />
                {getTranslation('aboutFilm', language)}
              </TabsTrigger>
              <TabsTrigger
                value="director"
                className="tabs-trigger"
              >
                <User className="h-4 w-4" />
                {getTranslation('aboutDirector', language)}
              </TabsTrigger>
              <TabsTrigger
                value="location"
                className="tabs-trigger"
              >
                <MapPin className="h-4 w-4" />
                {getTranslation('location', language)}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="film" className="space-y-6">
              <ScrollArea className="h-[300px] pr-4">

                <div className="bg-brown-200/30 dark:bg-brown-700 p-4 rounded-lg mb-6 border-l-4 border-brown-400 dark:border-brown-300">
                  <p className="text-md text-brown-900 dark:text-brown-100 italic">
                    {getTranslation('filmDescription', language)}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                  <InfoCard>
                    <CalendarCheck className="info-icon" />
                    <div className="flex justify-start align-center flex-col">
                      <p className="text-sm font-medium text-brown-500 dark:text-brown-400">
                        {getTranslation('filmYear', language)}
                      </p>
                      <p className="text-xl font-bold text-brown-900 dark:text-brown-100">
                        1975
                      </p>
                    </div>
                  </InfoCard>

                  <InfoCard>
                    <Clock className="info-icon" />
                    <div className="flex justify-start align-center flex-col">
                      <p className="text-sm font-medium text-brown-500 dark:text-brown-400">
                        {getTranslation('filmDuration', language)}
                      </p>
                      <p className="text-xl font-bold text-brown-900 dark:text-brown-100">
                        10:30
                      </p>
                    </div>
                  </InfoCard>

                  <InfoCard>
                    <Film className="info-icon" />
                    <div className="flex justify-start align-center flex-col gap-2">
                      <p className="text-sm font-medium text-brown-500 dark:text-brown-400">
                        {getTranslation('filmTechnique', language)}
                      </p>
                      <p className="text-brown-900 dark:text-brown-100 block text-sm lg:text-md">
                        {getTranslation('filmTechniqueValue', language)}
                      </p>
                    </div>
                  </InfoCard>

                  <InfoCard>
                    <Award className="info-icon" />
                    <div className="flex justify-start align-center flex-col gap-2">
                      <p className="text-sm font-medium text-brown-500 dark:text-brown-400">
                        {getTranslation('filmAwards', language)}
                      </p>
                      <p className="text-brown-900 dark:text-brown-100 text-sm lg:text-md">
                        {getTranslation('filmAwardsValue', language)}
                      </p>
                    </div>
                  </InfoCard>

                </div>

                <div className="mt-6 flex justify-end">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="text-brown-700 dark:text-brown-100 border-brown-300 dark:border-brown-600 hover:bg-brown-100 dark:hover:bg-brown-700">
                        <Bookmark className="mr-2 h-4 w-4" />
                        {getTranslation('aboutAuthors', language) || 'About authors'}
                      </Button>
                    </DialogTrigger>
                    <DialogContent
                      className="sm:max-w-[425px] md:max-w-[600px] bg-brown-50 dark:bg-brown-800 text-brown-900 dark:text-brown-100 z-1001"
                      onOpenAutoFocus={(e) => e.preventDefault()}
                    >
                      <DialogHeader>
                        <DialogTitle className="sans-serif text-center mb-3">{getTranslation('authors', language)}</DialogTitle>
                        {/* <DialogDescription className="text-brown-700 dark:text-brown-300"> */}

                      </DialogHeader>
                      <Table>
                        <TableBody>
                          <TableRow>
                            <TableCell className="font-semibold max-w-1/2">{getTranslation('authorDirector', language)}</TableCell>
                            <TableCell>
                              {language === "pl" ?
                                <a
                                  className="featured-link"
                                  href="https://culture.pl/pl/tworca/zbigniew-rybczynski"
                                  target="_blank"

                                >
                                  Zbigniew Rybczyński
                                </a> :
                                <a
                                  className="featured-link"
                                  href="https://culture.pl/en/artist/zbigniew-rybczynski"
                                  target="_blank"
                                >
                                  Zbigniew Rybczyński
                                </a>}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-semibold">{getTranslation('authorMusic', language)}</TableCell>
                            <TableCell>
                              {language === "pl" ?
                                <a
                                  className="featured-link"
                                  href="https://pl.wikipedia.org/wiki/Janusz_Hajdun"
                                  target="_blank"

                                >
                                  Janusz Hajdun
                                </a> :
                                'Janusz Hajdun'}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-semibold">{getTranslation('authorSecondDirector', language)}</TableCell>
                            <TableCell>
                              {language === "pl" ?
                                <a
                                  className="featured-link"
                                  href="https://culture.pl/pl/tworca/hieronim-neumann"
                                  target="_blank"

                                >
                                  Hieronim Nojman
                                </a> :
                                'Hieronim Nojman'}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-semibold">{getTranslation('authorSecondOperator', language)}</TableCell>
                            <TableCell>
                              {language === "pl" ?
                                <a
                                  className="featured-link"
                                  href="https://filmpolski.pl/fp/index.php?osoba=1114024"
                                  target="_blank"
                                >
                                  Janusz Olszewski
                                </a> :
                                <a
                                  className="featured-link"
                                  href="https://www.imdb.com/name/nm2590520"
                                  target="_blank"
                                >
                                  Janusz Olszewski
                                </a>}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-semibold">{getTranslation('authorProducer', language)}</TableCell>
                            <TableCell>
                              {language === "pl" ?
                                <a
                                  className="featured-link"
                                  href="https://filmpolski.pl/fp/index.php?osoba=1123409"
                                  target="_blank"

                                >
                                  Andrzej Wawrzonowski
                                </a> :
                                'Andrzej Wawrzonowski'}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-semibold">{getTranslation('authorSecondProducer', language)}</TableCell>
                            <TableCell>
                              {language === "pl" ?
                                <a
                                  className="featured-link"
                                  href="https://filmpolski.pl/fp/index.php?osoba=112028"
                                  target="_blank"

                                >
                                  Zygmunt Smyczek
                                </a> :
                                <a
                                  className="featured-link"
                                  href="https://www.imdb.com/name/nm4448574"
                                  target="_blank"

                                >
                                  Zygmunt Smyczek
                                </a>}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-semibold">{getTranslation('authorSound', language)}</TableCell>
                            <TableCell>
                              {language === "pl" ?
                                <a
                                  className="featured-link"
                                  href="https://filmpolski.pl/fp/index.php?osoba=114230"
                                  target="_blank"

                                >
                                  Mieczysław Janik
                                </a> :
                                <a
                                  className="featured-link"
                                  href="https://www.imdb.com/name/nm0417614"
                                  target="_blank"

                                >
                                  Mieczysław Janik
                                </a>}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-semibold">{getTranslation('authorEditor', language)}</TableCell>
                            <TableCell>
                              {language === "pl" ?
                                <a
                                  className="featured-link"
                                  href="https://filmpolski.pl/fp/index.php?osoba=11109578"
                                  target="_blank"

                                >
                                  Barbara Sarnocińska
                                </a> :
                                <a
                                  className="featured-link"
                                  href="https://www.imdb.com/name/nm1516261"
                                  target="_blank"

                                >
                                  Barbara Sarnocińska
                                </a>}
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </DialogContent>
                  </Dialog>
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="director" className="space-y-4">
              <ScrollArea className="h-[300px] pr-4">
                <div className="bg-brown-200/30 dark:bg-brown-700 p-4 rounded-lg mb-6 border-l-4 border-brown-400 dark:border-brown-300">
                  <p className="text-md text-brown-900 dark:text-brown-100 italic">
                    {getTranslation('directorDescription', language)}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                  <InfoCard>
                    <Baby className="info-icon" />
                    <div className="flex justify-start align-center flex-col gap-2">
                      <p className="text-sm font-medium text-brown-500 dark:text-brown-400">
                        {getTranslation('directorBorn', language)}
                      </p>
                      <p className="text-xl font-bold text-brown-900 dark:text-brown-100">
                        1949, Łódź
                      </p>
                    </div>
                  </InfoCard>

                  <InfoCard>
                    <GraduationCap className="info-icon" />
                    <div className="flex justify-start align-center flex-col gap-2">
                      <p className="text-sm font-medium text-brown-500 dark:text-brown-400">
                        {getTranslation('directorEducation', language)}
                      </p>
                      <p className="text-brown-900 dark:text-brown-100 text-sm lg:text-md">
                        {getTranslation('directorEducationValue', language)}
                      </p>
                    </div>
                  </InfoCard>

                  <InfoCard>
                    <Trophy className="info-icon" />
                    <div className="flex justify-start align-center flex-col gap-2">
                      <p className="text-sm font-medium text-brown-500 dark:text-brown-400">
                        {getTranslation('directorAchievements', language)}
                      </p>
                      <p className="text-brown-900 dark:text-brown-100 text-sm lg:text-md">
                        {getTranslation('directorAchievementsValue', language)}
                      </p>
                    </div>
                  </InfoCard>

                  <InfoCard>
                    <Fingerprint className="info-icon" />
                    <div className="flex justify-start align-center flex-col gap-2">
                      <p className="text-sm font-medium text-brown-500 dark:text-brown-400">
                        {getTranslation('directorLegacy', language)}
                      </p>
                      <p className="text-brown-900 dark:text-brown-100 text-sm lg:text-md">
                        {getTranslation('directorLegacyValue', language)}
                      </p>
                    </div>
                  </InfoCard>

                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="location" className="space-y-4">
              <ScrollArea className="h-[300px] pr-4">
                <div className="bg-brown-200/30 dark:bg-brown-700 p-4 rounded-lg mb-6 border-l-4 border-brown-400 dark:border-brown-300">
                  <p className="text-md text-brown-900 dark:text-brown-100 italic">
                    {getTranslation('locationDescription', language)}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                  <InfoCard>
                    <Building2 className="info-icon" />
                    <div className="flex justify-start align-center flex-col gap-2">
                      <p className="text-sm font-medium text-brown-500 dark:text-brown-400">
                        {getTranslation('locationCity', language)}
                      </p>
                      <p className="text-brown-900 dark:text-brown-100 text-sm lg:text-md">
                        {getTranslation('locationCityValue', language)}
                      </p>
                    </div>
                  </InfoCard>

                  <InfoCard>
                    <Clapperboard className="info-icon" />
                    <div className="flex justify-start align-center flex-col gap-2">
                      <p className="text-sm font-medium text-brown-500 dark:text-brown-400">
                        {getTranslation('locationStudio', language)}
                      </p>
                      <p className="text-brown-900 dark:text-brown-100 text-sm lg:text-md">
                        {getTranslation('locationStudioValue', language)}
                      </p>
                    </div>
                  </InfoCard>

                  <InfoCard>
                    <Bookmark className="info-icon" />
                    <div className="flex justify-start align-center flex-col gap-2">
                      <p className="text-sm font-medium text-brown-500 dark:text-brown-400">
                        {getTranslation('locationSignificance', language)}
                      </p>
                      <p className="text-brown-900 dark:text-brown-100 text-sm lg:text-md">
                        {getTranslation('locationSignificanceValue', language)}
                      </p>
                    </div>
                  </InfoCard>

                  <InfoCard>
                    <CalendarX className="info-icon" />
                    <div className="flex justify-start align-center flex-col gap-2">
                      <p className="text-sm font-medium text-brown-500 dark:text-brown-400">
                        {getTranslation('locationToday', language)}
                      </p>
                      <p className="text-brown-900 dark:text-brown-100 text-sm lg:text-md">
                        {getTranslation('locationTodayValue', language)}
                      </p>
                    </div>
                  </InfoCard>

                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </CardContent>
      </GlowingCard>
    </div>
  );
} 