<style>{`
  @media print {
    body * {
      visibility: hidden;
    }
    #printable-result-card, #printable-result-card * {
      visibility: visible;
    }
    #printable-result-card {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: auto;
      box-shadow: none !important;
      border: 2px solid #1e293b;
      border-radius: 0 !important;
      margin: 0 !important;
      padding: 20px !important;
      background: white !important;
      color: black !important;
    }
    .print-hide {
      display: none !important;
    }
    * {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
  }
`}</style>
