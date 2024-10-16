import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common'; 

declare var qz: any;

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  template: `
    <div #printSection id="printSection" [innerHTML]="receiptContent"></div>
    <button (click)="printReceipt()">Print Receipt</button>
    <button (click)="printQZReceipt()">Print QZReceipt</button>
    <button (click)="printPDFReceipt()">Print PDFReceipt</button>
  `,
  styles: [`
    @media print {
      #printSection {
        width: 80mm; /* Adjust for thermal printer width */
        font-size: 12px;
        margin: 0;
      }
      button {
        display: none;
      }
    }
  `]
})
export class AppComponent {
  receiptContent = '';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadReceipt();
  }

  loadReceipt() {
    this.http.get('/api/receipt/generate', { responseType: 'text' })
      .subscribe(data => {
        this.receiptContent = data;
      });
  }

  printReceipt() {
    setTimeout(() => {
      window.print();
    }, 100); // Delay for rendering
  }

  printQZReceipt() {
    qz.websocket.connect().then(() => {
      return qz.printers.find("Your Thermal Printer Name"); // Find your thermal printer
    }).then((printer: any) => {
      let config = qz.configs.create(printer); // Create a config for the printer
      let data = [
        { type: 'html', format: 'plain', data: this.receiptContent } // Sample receipt data
      ];
      return qz.print(config, data);
    }).catch((err: any) => console.error(err));
  }

  printPDFReceipt() {
    this.http.get('/api/receipt/pdf', { responseType: 'blob' })
      .subscribe((pdfBlob) => {
        // Create a blob URL for the PDF
        const blob = new Blob([pdfBlob], { type: 'application/pdf' });
        const blobUrl = URL.createObjectURL(blob);

        // Open the PDF in a new window or iframe and trigger the print dialog
        const newWindow = window.open(blobUrl);
        if (newWindow) {
          newWindow.focus(); // Ensure the new window is focused
          newWindow.print(); // Trigger print dialog
        }
      }, error => {
        console.error('Error downloading the PDF', error);
      });
  }
  
}
