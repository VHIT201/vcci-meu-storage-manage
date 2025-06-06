"use client"; // Đánh dấu component client-side
import { useState, useEffect } from "react";
import Config from "../../config/config";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css"; // Thêm styles của react-pdf-viewer

export default function Home() {
  const [files, setFiles] = useState([]);
  const [imageList, setImageList] = useState([]);
  const [videoList, setVideoList] = useState([]);
  const [fileList, setFileList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [imagesPerPage] = useState(20);
  const [pageInput, setPageInput] = useState(currentPage);
  const [activeTab, setActiveTab] = useState("images");
  const [loading, setLoading] = useState(false);
  const [selectedPdf, setSelectedPdf] = useState(null); // Trạng thái lưu file PDF được chọn

  // Hàm xóa file
  async function deleteFile(filePath) {
    try {
      const response = await fetch(`${Config.apiEndpoint}/files`, {
        method: "DELETE",
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ filePath }),
      });
      if (!response.ok) throw new Error("Failed to delete file");
      getFiles();
    } catch (error) {
      console.error("Error deleting file:", error);
    }
  }

  // Hàm lấy dữ liệu từ API
  async function getFiles() {
    setLoading(true);
    try {
      const response = await fetch(`${Config.apiEndpoint}/files`);
      if (!response.ok) throw new Error("Network response was not ok");
      const data = await response.json();
      setFiles(data);
      setImageList(data?.responseData.images);
      setVideoList(data?.responseData.videos);
      setFileList(data?.responseData.files);
    } catch (error) {
      console.error("Error fetching files:", error);
    } finally {
      setLoading(false);
    }
  }

  // useEffect để gọi API khi component được mount
  useEffect(() => {
    getFiles();
  }, []);

  // Logic phân trang
  const indexOfLastImage = currentPage * imagesPerPage;
  const indexOfFirstImage = indexOfLastImage - imagesPerPage;
  const currentImages = imageList.slice(indexOfFirstImage, indexOfLastImage);

  const indexOfLastVideo = currentPage * imagesPerPage;
  const indexOfFirstVideo = indexOfLastVideo - imagesPerPage;
  const currentVideos = videoList.slice(indexOfFirstVideo, indexOfLastVideo);

  const indexOfLastFile = currentPage * imagesPerPage;
  const indexOfFirstFile = indexOfLastFile - imagesPerPage;
  const currentFiles = fileList.slice(indexOfFirstFile, indexOfLastFile);

  // Hàm chuyển trang
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Hàm thay đổi trang thông qua ô nhập
  const handlePageChange = (e) => {
    if (e.key === "Enter") {
      const newPage = pageInput;
      if (newPage > 0 && newPage <= Math.ceil(imageList.length / imagesPerPage)) {
        setCurrentPage(newPage);
      } else {
        alert("Vui lòng nhập trang hợp lệ!");
      }
    }
  };

  // Tổng số trang
  const totalPages = Math.ceil(imageList.length / imagesPerPage);

  // Hàm mở file PDF
  const handlePdfClick = (filePath) => {
    if (filePath.endsWith(".pdf")) {
      setSelectedPdf(filePath); // Set file PDF hiện tại
    }
  };

  return (
    <div className="w-full min-h-screen bg-gray-100 flex flex-col items-center justify-center py-10">
      <h1 className="text-3xl font-bold text-center mb-8">File List</h1>

      {/* Tab navigation */}
      <div className="mb-6 flex space-x-4">
        <button
          onClick={() => setActiveTab("images")}
          className={`px-4 py-2 rounded-md ${activeTab === "images" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
          disabled={loading}
        >
          Images
        </button>
        <button
          onClick={() => setActiveTab("videos")}
          className={`px-4 py-2 rounded-md ${activeTab === "videos" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
          disabled={loading}
        >
          Videos
        </button>
        <button
          onClick={() => setActiveTab("files")}
          className={`px-4 py-2 rounded-md ${activeTab === "files" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
          disabled={loading}
        >
          Files
        </button>
      </div>

      {/* Content */}
      {activeTab === "images" && imageList.length > 0 && (
        <div className="w-full max-w-4xl mx-auto">
          <h2 className="text-xl font-semibold mb-4">Image List</h2>
          <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {currentImages.map((image, index) => (
              <li key={index} className="relative rounded-lg overflow-hidden shadow-lg">
                <img
                  src={Config.imageEndpoint + image}
                  alt={`Image ${index + 1}`}
                  className="w-full h-auto object-cover"
                />
                <button
                  onClick={() => deleteFile(image)}
                  className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-2 hover:bg-red-700 transition duration-200"
                  disabled={loading}
                >
                  Xóa
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {activeTab === "videos" && videoList.length > 0 && (
        <div className="w-full max-w-4xl mx-auto">
          <h2 className="text-xl font-semibold mb-4">Video List</h2>
          <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {currentVideos.map((video, index) => (
              <li key={index} className="relative rounded-lg overflow-hidden shadow-lg">
                <video controls className="w-full h-auto">
                  <source src={Config.imageEndpoint + video} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
                <button
                  onClick={() => deleteFile(video)}
                  className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-2 hover:bg-red-700 transition duration-200"
                  disabled={loading}
                >
                  Xóa
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {activeTab === "files" && fileList.length > 0 && (
        <div className="w-full max-w-4xl mx-auto">
          <h2 className="text-xl font-semibold mb-4">File List</h2>
          <ul className="grid grid-cols-1 gap-4">
            {currentFiles.map((file, index) => (
              <li key={index} className="flex justify-between items-center bg-gray-200 p-4 rounded-md shadow-md">
                <a
                  href={Config.imageEndpoint + file}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600"
                  onClick={() => handlePdfClick(file)} // Mở PDF khi click
                >
                  {file}
                </a>
                <button
                  onClick={() => deleteFile(file)}
                  className="bg-red-600 text-white rounded-full p-2 hover:bg-red-700 transition duration-200"
                  disabled={loading}
                >
                  Xóa
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Nếu có file PDF được chọn, hiển thị trình đọc PDF */}
      {selectedPdf && (
        <div className="mt-6 w-full max-w-4xl mx-auto">
          <h2 className="text-xl font-semibold mb-4">PDF Viewer</h2>
          <iframe
            src={Config.imageEndpoint + selectedPdf}
            width="100%"
            height="600px"
            frameBorder="0"
          />
        </div>
      )}

      {/* Phân trang */}
      <div className="flex justify-center items-center mt-6 space-x-4">
        <button
          onClick={() => paginate(currentPage - 1)}
          disabled={currentPage === 1 || loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:bg-gray-300 transition duration-200 hover:bg-blue-700"
        >
          Previous
        </button>

        <span className="text-lg text-blue-500">{`Page ${currentPage} of ${totalPages}`}</span>

        <input
          type="number"
          value={pageInput}
          onChange={(e) => setPageInput(Number(e.target.value))}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              const newPage = pageInput;
              if (newPage > 0 && newPage <= totalPages) {
                setCurrentPage(newPage);
              } else {
                alert("Vui lòng nhập trang hợp lệ!");
              }
            }
          }}
          className="px-3 py-2 border border-gray-300 rounded-md"
          placeholder="Go to page"
          min={1}
          max={totalPages}
          disabled={loading}
        />

        <button
          onClick={() => paginate(currentPage + 1)}
          disabled={currentPage * imagesPerPage >= imageList.length || loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:bg-gray-300 transition duration-200 hover:bg-blue-700"
        >
          Next
        </button>
      </div>

      {/* Loading spinner */}
      {loading && (
        <div className="absolute inset-0 flex justify-center items-center bg-gray-800 bg-opacity-50 z-50">
          <div className="w-16 h-16 border-4 border-t-4 border-blue-600 rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
}
