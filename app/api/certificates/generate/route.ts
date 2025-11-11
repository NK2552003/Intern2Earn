import { NextRequest, NextResponse } from "next/server"
import { createServerClient_ } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { applicationId, studentId } = body

    console.log("Certificate generation request:", { applicationId, studentId })

    if (!applicationId || !studentId) {
      return NextResponse.json(
        { error: "Application ID and Student ID are required" },
        { status: 400 }
      )
    }

    const supabase = await createServerClient_()

    // Get application details with internship and student information
    const { data: application, error: appError } = await supabase
      .from("applications")
      .select(`
        id,
        student_id,
        internship_id,
        status,
        student:profiles!applications_student_id_fkey(full_name, email),
        internship:internships(title, company_name, duration_weeks)
      `)
      .eq("id", applicationId)
      .single()

    if (appError) {
      console.error("Error fetching application:", appError)
      return NextResponse.json(
        { error: "Application not found", details: appError.message },
        { status: 404 }
      )
    }

    if (!application) {
      console.error("Application not found for ID:", applicationId)
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      )
    }

    // Verify the student ID matches the application
    if (application.student_id !== studentId) {
      console.error("Student ID mismatch:", {
        provided: studentId,
        expected: application.student_id,
      })
      return NextResponse.json(
        { error: "Student ID does not match the application" },
        { status: 403 }
      )
    }

    console.log("Application found:", application)

    // Check if the submission has been approved
    const { data: submission } = await supabase
      .from("submissions")
      .select("id, status")
      .eq("application_id", applicationId)
      .eq("status", "approved")
      .maybeSingle()

    if (!submission) {
      console.log("No approved submission found for application:", applicationId)
      return NextResponse.json(
        { 
          error: "Certificate can only be generated for approved submissions",
          message: "The internship submission must be approved before a certificate can be issued"
        },
        { status: 400 }
      )
    }

    // Check if certificate already exists
    const { data: existingCert, error: checkError } = await supabase
      .from("certificates")
      .select("id, title, issued_at")
      .eq("application_id", applicationId)
      .maybeSingle()

    if (checkError) {
      console.error("Error checking existing certificate:", checkError)
    }

    if (existingCert) {
      console.log("Certificate already exists:", existingCert.id)
      return NextResponse.json(
        { 
          message: "Certificate already exists for this application",
          certificateId: existingCert.id,
          alreadyExists: true,
          certificate: existingCert
        },
        { status: 200 }
      )
    }

    // Create certificate
    const internship = application.internship as any
    const certificateTitle = `Certificate of Completion - ${internship.title}`
    
    console.log("Creating certificate with data:", {
      student_id: studentId,
      application_id: applicationId,
      title: certificateTitle,
    })

    const { data: certificate, error: certError } = await supabase
      .from("certificates")
      .insert({
        student_id: studentId,
        application_id: applicationId,
        title: certificateTitle,
        issued_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (certError) {
      console.error("Error creating certificate:", certError)
      
      // Check if this is a unique constraint violation (duplicate)
      if (certError.code === "23505") {
        // Try to fetch the existing certificate
        const { data: existingCertAfterError } = await supabase
          .from("certificates")
          .select("id, title, issued_at")
          .eq("application_id", applicationId)
          .maybeSingle()

        if (existingCertAfterError) {
          return NextResponse.json(
            { 
              message: "Certificate already exists for this application",
              certificateId: existingCertAfterError.id,
              alreadyExists: true,
              certificate: existingCertAfterError
            },
            { status: 200 }
          )
        }
      }
      
      return NextResponse.json(
        { error: "Failed to create certificate", details: certError.message },
        { status: 500 }
      )
    }

    console.log("Certificate created successfully:", certificate)

    return NextResponse.json(
      {
        message: "Certificate generated successfully",
        certificate,
        alreadyExists: false,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error in certificate generation:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
