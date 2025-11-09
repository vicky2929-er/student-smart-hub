import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./Student.css";

const PDFViewer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pdfUrl, setPdfUrl] = useState(null);
  const [studentName, setStudentName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchPDFData();
  }, [id]);

  const fetchPDFData = async () => {
    try {
      setLoading(true);
      setError("");

      // First, try to get existing PDF URL
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/students/pdf-url/${id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setPdfUrl(data.pdf_url);
        setStudentName(data.student_name);
      } else if (response.status === 404) {
        // PDF doesn't exist, generate it
        await generatePDF();
      } else {
        throw new Error(`Failed to fetch PDF: ${response.status}`);
      }
    } catch (error) {
      console.error("Error fetching PDF:", error);
      setError("Failed to load PDF. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/students/generate-pdf/${id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`PDF generation failed: ${response.status}`);
      }

      const data = await response.json();
      
      // Get the actual PDF URL for viewing
      const pdfDataResponse = await fetch(
        `${process.env.REACT_APP_API_URL}/students/pdf-url/${id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (pdfDataResponse.ok) {
        const pdfData = await pdfDataResponse.json();
        setPdfUrl(pdfData.pdf_url);
        setStudentName(pdfData.student_name);
      }
    } catch (error) {
      console.error("Error generating PDF:", error);
      throw error;
    }
  };

  const handleDownloadPDF = () => {
    if (pdfUrl) {
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = `${studentName}_Portfolio.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleShareLink = () => {
    const shareUrl = window.location.href;
    navigator.clipboard
      .writeText(shareUrl)
      .then(() => {
        alert("PDF link copied to clipboard!");
      })
      .catch(() => {
        alert(`Share this link: ${shareUrl}`);
      });
  };

  const handleViewPortfolio = () => {
    navigate(`/students/portfolio/${id}`);
  };

  if (loading) {
    return (
      <div className="pdf-viewer-standalone">
        <div className="pdf-loading-container">
          <div className="loading-spinner">
            <i className="fas fa-spinner fa-spin"></i>
          </div>
          <p>Loading PDF...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pdf-viewer-standalone">
        <div className="pdf-error-container">
          <div className="error-icon">
            <i className="fas fa-exclamation-triangle"></i>
          </div>
          <h2>Error Loading PDF</h2>
          <p>{error}</p>
          <button onClick={fetchPDFData} className="retry-btn">
            <i className="fas fa-redo"></i>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!pdfUrl) {
    return (
      <div className="pdf-viewer-standalone">
        <div className="pdf-error-container">
          <div className="error-icon">
            <i className="fas fa-file-times"></i>
          </div>
          <h2>PDF Not Available</h2>
          <p>The portfolio PDF could not be found or generated.</p>
          <button onClick={handleViewPortfolio} className="portfolio-btn">
            <i className="fas fa-user"></i>
            View Portfolio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pdf-viewer-standalone">
      <div className="pdf-standalone-content">
        <iframe
          src={pdfUrl}
          title={`${studentName} Portfolio PDF`}
          width="100%"
          height="100%"
          frameBorder="0"
        />
      </div>
    </div>
  );
};

export default PDFViewer;
