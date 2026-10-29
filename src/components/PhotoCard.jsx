export default function PhotoCard({ photo }) {
  const imageUrl = `https://drive.google.com/thumbnail?id=${photo.fileId}&sz=w800`;
  const downloadUrl = `https://drive.google.com/uc?export=download&id=${photo.fileId}`;

  // Konversi timestamp menjadi waktu WITA (GMT+8)
  const timeOptions = { 
    timeZone: 'Asia/Makassar', 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit' 
  };
  const formattedDate = new Date(photo.timestamp).toLocaleString('id-ID', timeOptions) + ' WITA';

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow border">
      <img 
        src={imageUrl} 
        alt={photo.title} 
        loading="lazy" 
        className="w-full h-48 object-cover bg-gray-100"
      />
      <div className="p-4 flex flex-col gap-2">
        <h3 className="font-semibold text-gray-800 truncate" title={photo.title}>{photo.title}</h3>
        <p className="text-xs text-gray-500 font-medium">{formattedDate}</p>
        
        <a 
          href={downloadUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="mt-2 text-center bg-blue-600 text-white px-3 py-1.5 rounded text-sm font-semibold hover:bg-blue-700 transition"
        >
          Download File
        </a>
      </div>
    </div>
  );
}