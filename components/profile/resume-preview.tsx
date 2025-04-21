"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { type ParsedResume, formatDate } from "@/lib/resume-parser"
import { Download, Printer } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"

interface ResumePreviewProps {
  resume: ParsedResume
}

export function ResumePreview({ resume }: ResumePreviewProps) {
  const [isPrinting, setIsPrinting] = useState(false)

  const handlePrint = () => {
    setIsPrinting(true)
    setTimeout(() => {
      window.print()
      setIsPrinting(false)
    }, 100)
  }

  const handleDownload = () => {
    // In a real app, this would generate a PDF using a library like jsPDF or call a server endpoint
    alert("In a real app, this would download a PDF of your resume")
  }

  return (
    <Card className={isPrinting ? "print:shadow-none print:border-none" : ""}>
      <CardHeader className="print:pb-2">
        <CardTitle>Resume Preview</CardTitle>
        <CardDescription>Preview how your resume will appear to employers</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 print:space-y-4">
        <div className="space-y-2 print:space-y-1">
          <h2 className="text-2xl font-bold text-center print:text-xl">{resume.basics.name}</h2>
          <p className="text-center text-muted-foreground">{resume.basics.title}</p>
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            {resume.basics.email && <span>{resume.basics.email}</span>}
            {resume.basics.phone && <span>{resume.basics.phone}</span>}
            {resume.basics.location && <span>{resume.basics.location}</span>}
            {resume.basics.website && <span>{resume.basics.website}</span>}
          </div>
        </div>

        {resume.basics.summary && (
          <>
            <div className="space-y-2 print:space-y-1">
              <h3 className="text-lg font-semibold print:text-base">Summary</h3>
              <p className="text-sm">{resume.basics.summary}</p>
            </div>
            <Separator className="print:hidden" />
          </>
        )}

        {resume.work.length > 0 && (
          <>
            <div className="space-y-4 print:space-y-2">
              <h3 className="text-lg font-semibold print:text-base">Experience</h3>
              {resume.work.map((job, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div>
                      <h4 className="font-medium print:text-sm">{job.position}</h4>
                      <p className="text-sm text-muted-foreground print:text-xs">{job.company}</p>
                    </div>
                    <p className="text-sm text-muted-foreground print:text-xs">
                      {formatDate(job.startDate)} - {formatDate(job.endDate)}
                    </p>
                  </div>
                  {job.summary && <p className="text-sm print:text-xs">{job.summary}</p>}
                  {job.highlights.length > 0 && (
                    <ul className="list-disc list-inside text-sm space-y-0.5 pl-1 print:text-xs">
                      {job.highlights.map((highlight, hIndex) => (
                        <li key={hIndex}>{highlight}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
            <Separator className="print:hidden" />
          </>
        )}

        {resume.education.length > 0 && (
          <>
            <div className="space-y-4 print:space-y-2">
              <h3 className="text-lg font-semibold print:text-base">Education</h3>
              {resume.education.map((edu, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div>
                      <h4 className="font-medium print:text-sm">
                        {edu.studyType} in {edu.area}
                      </h4>
                      <p className="text-sm text-muted-foreground print:text-xs">{edu.institution}</p>
                    </div>
                    <p className="text-sm text-muted-foreground print:text-xs">
                      {formatDate(edu.startDate)} - {formatDate(edu.endDate)}
                    </p>
                  </div>
                  {edu.gpa && <p className="text-sm print:text-xs">GPA: {edu.gpa}</p>}
                </div>
              ))}
            </div>
            <Separator className="print:hidden" />
          </>
        )}

        {resume.skills.length > 0 && (
          <div className="space-y-4 print:space-y-2">
            <h3 className="text-lg font-semibold print:text-base">Skills</h3>
            <div className="space-y-3 print:space-y-2">
              {resume.skills.map((skill, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium print:text-sm">{skill.name}</h4>
                    <Badge variant="secondary" className="print:bg-gray-200 print:text-black">
                      {skill.level}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {skill.keywords.map((keyword, kIndex) => (
                      <Badge key={kIndex} variant="outline" className="print:border-gray-300 print:text-black">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex gap-2 print:hidden">
        <Button variant="outline" onClick={handlePrint} className="flex-1">
          <Printer className="h-4 w-4 mr-2" />
          Print
        </Button>
        <Button onClick={handleDownload} className="flex-1">
          <Download className="h-4 w-4 mr-2" />
          Download PDF
        </Button>
      </CardFooter>

      <style jsx global>{`
        @media print {
          @page {
            margin: 0.5cm;
          }
          body * {
            visibility: hidden;
          }
          .${Card.name}, .${Card.name} * {
            visibility: visible;
          }
          .${Card.name} {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            box-shadow: none;
            border: none;
          }
          .print\\:hidden {
            display: none;
          }
        }
      `}</style>
    </Card>
  )
}
