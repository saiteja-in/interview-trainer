import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy } from "lucide-react"

export function StreakCard() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center">
          <Trophy className="h-8 w-8 text-primary mb-1" />
          <div className="text-2xl font-bold">7</div>
          <p className="text-xs text-muted-foreground">days</p>
        </div>
      </CardContent>
    </Card>
  )
}
