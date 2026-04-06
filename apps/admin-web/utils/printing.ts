export const printWaybill = (wayId: string) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  printWindow.document.write(`
    <html>
      <head>
        <title>Print Waybill - ${wayId}</title>
        <style>
          @page { size: 4in 6in; margin: 0; }
          body { font-family: sans-serif; padding: 20px; }
          .barcode { text-align: center; margin-top: 20px; }
          .header { font-size: 24px; font-weight: 900; border-bottom: 2px solid black; }
          .details { margin-top: 15px; font-size: 12px; }
        </style>
      </head>
      <body onload="window.print(); window.close();">
        <div class="header">BEX</div>
        <div class="details">
          <strong>TRACKING:</strong> ${wayId}<br/>
          <strong>TO:</strong> Yangon, Myanmar
        </div>
        <div class="barcode"> [QR CODE HERE] </div>
      </body>
    </html>
  `);
};