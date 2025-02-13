import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileDownload } from '@fortawesome/free-solid-svg-icons';

const DownloadTicket = ({ pdfBase64 }) => {
  const handleDownload = () => {
    const byteCharacters = atob(pdfBase64);
    const byteNumbers = new Array(byteCharacters.length)
      .fill()
      .map((_, i) => byteCharacters.charCodeAt(i));
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'application/pdf' });

    const blobUrl = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = 'ticket.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <button
      onClick={handleDownload}
      className="mr-auto ml-2 text-left rounded-lg p-2 flex flex-row items-center justify-start bg-[#334155] text-white"
    >
      <div className="mr-2 text-base font-light">Ticket.pdf</div>
      <FontAwesomeIcon icon={faFileDownload} color="white" />
    </button>
  );
};

export default DownloadTicket;