import { Card, CardContent } from "./ui/card"
type InfoCardProps = {
    children: React.ReactNode
};

const InfoCard: React.FC<InfoCardProps> = ({ children }) => {
    return (
        <Card className="bg-brown-50/70 dark:bg-brown-800/70 border border-brown-200 dark:border-brown-600 h-full p-2">
            <CardContent className="grid grid-cols-[32px_auto] h-full place-content-start gap-5">
                {children}
            </CardContent>
        </Card>
    )}

    export default InfoCard