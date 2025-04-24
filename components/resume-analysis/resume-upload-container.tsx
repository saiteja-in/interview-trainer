import ResumeUpload from "./resume-jobs";

export default function ResumeUploadContainer() {
  const handleResumeUploaded = () => {
    // Refresh the page to get fresh server data
    window.location.reload();
  };

  return <ResumeUpload onSuccess={handleResumeUploaded} />;
}