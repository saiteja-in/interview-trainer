import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Award } from "lucide-react"

export function UpcomingMilestone() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Next Milestone</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center">
          <Award className="h-8 w-8 text-primary mb-1" />
          <div className="text-2xl font-bold">10</div>
          <p className="text-xs text-muted-foreground">interviews</p>
        </div>
      </CardContent>
    </Card>
  )
}
