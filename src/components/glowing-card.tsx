import { Card } from "./ui/card"
import { GlowingEffect } from "./ui/glowing-effect";

interface GlowingCardProps {
  children: React.ReactNode;
}

const GlowingCard = ({ children }: GlowingCardProps) => {
  return (
    <div className="relative w-full order-1 border-0 rounded-xl">
      <GlowingEffect
          spread={80}
          glow={true}
          disabled={false}
          proximity={64}
          inactiveZone={0.01}
          borderWidth={2}
          variant={"default"}
        />

      <Card className="border-0 rounded-xl bg-gradient-to-b from-brown-100/60 to-brown-200/40 dark:from-brown-500 dark:to-brown-800">
        { children }
      </Card>
    </div>
  )
}

export default GlowingCard