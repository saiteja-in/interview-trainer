import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, Clock } from "lucide-react"
import Link from "next/link"

export function DailyChallenge() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Daily Challenge</CardTitle>
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
            <Clock className="h-3 w-3 mr-1" /> 4h left
          </Badge>
        </div>
        <CardDescription>Complete today's challenge to earn XP</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <h3 className="font-medium">Implement a Rate Limiter</h3>
          <p className="text-sm text-muted-foreground">
            Design and implement a rate limiting system that can be used to control the rate of traffic sent to or
            received from a network.
          </p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
            <CalendarDays className="h-3 w-3" />
            <span>May 2, 2023</span>
            <Badge variant="outline" className="text-xs ml-auto">
              Medium
            </Badge>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full">
          <Link href="/interview/daily">Start Challenge</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
