import React from 'react';
import { Modal, Button, Table } from 'react-bootstrap';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../styles/HomePage/HomePage.css';

const ReportPage = ({ searchCriteria, rows, show, handleClose }) => {
    const { startDate, endDate, interval, selectedColumns } = searchCriteria;
    const user = JSON.parse(localStorage.getItem('user'));
    const reportHeader = user?.reportHeader;

    // Ensure 'DateAndTime' is always included
    const columnsToDisplay = ['DateAndTime', ...selectedColumns.filter(column => column !== 'DateAndTime')];

    const downloadPDF = () => {
        const doc = new jsPDF();
    
        // Draw the header background
        doc.setFillColor(0, 153, 204); // Teal color
        doc.rect(0, 10, doc.internal.pageSize.width, 20, 'F'); // Draw filled rectangle
    
        // Add the main report title inside the header
        doc.setFontSize(18);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(255, 255, 255); // White color for the title text
        doc.text('Report', 105, 25, null, null, 'center'); // Centered title
    
        // Check if reportHeader exists and add it below the header
        if (reportHeader) {
            doc.setFontSize(14); // Slightly smaller font for the report header
            doc.setFont("helvetica", "normal");
            doc.setTextColor(0, 0, 0); // Black color for the header text
            doc.text(reportHeader, 14, 40); // Placed below the title
        }
    
        // Formatting and adding the date range
        const formattedStartDate = new Date(startDate).toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'short' });
        const formattedEndDate = new Date(endDate).toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'short' });
    
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(0, 0, 0); // Black color for text
        doc.text('Reporting Period From:', 14, 55);
        doc.text('To:', 120, 55);
    
        doc.setFont("helvetica", "normal");
        doc.text(formattedStartDate, 14, 65); // Start date
        doc.text(formattedEndDate, 120, 65); // End date
    
        // Add the interval below the date range
        doc.setFont("helvetica", "bold");
        doc.text('Interval:', 14, 75); // Label for interval
    
        doc.setFont("helvetica", "normal");
        doc.text(`${interval} Minutes`, 40, 75); // Display the interval value
    
        // Line separator
        doc.setDrawColor(150); // Gray color for the line
        doc.line(10, 80, doc.internal.pageSize.width - 10, 80);
    
        // Define table options for better styling
        const tableOptions = {
            startY: 85, // Adjust the start position based on the header, date range, and interval
            headStyles: {
                fillColor: [0, 123, 255], // Bootstrap primary color
                textColor: 255,
                fontSize: 12,
                halign: 'center', // Center align header text
            },
            bodyStyles: {
                fontSize: 10,
                halign: 'center', // Center align body text
            },
            alternateRowStyles: {
                fillColor: [240, 240, 240] // Light gray for alternate rows
            },
            margin: { top: 10 },
        };
    
        // Prepare the table header and body dynamically based on selected columns
        const tableHeader = columnsToDisplay.map(column => column.replace(/_/g, ' ')); // Convert underscores to spaces
        const tableBody = rows.map(row => {
            return columnsToDisplay.map(column => {
                // Format DateAndTime if it's part of the columns to display
                if (column === 'DateAndTime') {
                    return new Date(row[column]).toLocaleString('en-US', {
                        dateStyle: 'medium', // e.g., 'Sep 5, 2024'
                        timeStyle: 'short'   // e.g., '2:35 PM'
                    });
                }
                return row[column];
            });
        });
    
        // Add the table to the PDF with styling
        autoTable(doc, {
            head: [tableHeader],
            body: tableBody,
            ...tableOptions
        });
    
        // Add a footer with page number
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(10);
            doc.setTextColor(150);
            doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.width / 2, doc.internal.pageSize.height - 10, { align: 'center' });
        }
    
        doc.save('report.pdf');
    };
    
    const downloadExcel = () => {
        // Prepare data for Excel export based on selected columns
        const excelData = rows.map(row => {
            const rowData = {};
            columnsToDisplay.forEach(column => {
                rowData[column] = row[column];
            });
            return rowData;
        });
    
        // Create a new worksheet
        const worksheet = XLSX.utils.json_to_sheet([]);
    
        let currentRow = 0;
    
        // Add the report header to the Excel sheet if it exists
        if (reportHeader) {
            XLSX.utils.sheet_add_aoa(worksheet, [[reportHeader]], { origin: `A${currentRow + 1}` });
            currentRow += 2; // Leave a space after the header
        }
    
        // Format and add the date range
        const formattedStartDate = new Date(startDate).toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'short' });
        const formattedEndDate = new Date(endDate).toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'short' });
    
        XLSX.utils.sheet_add_aoa(worksheet, [
            ['Reporting Period From:', formattedStartDate, '', 'To:', formattedEndDate]
        ], { origin: `A${currentRow + 1}` });
    
        currentRow += 2; // Leave a space after the date range
    
        // Add the interval information
        XLSX.utils.sheet_add_aoa(worksheet, [
            ['Interval:', `${interval} Minutes`]
        ], { origin: `A${currentRow + 1}` });
    
        currentRow += 2; // Leave a space after the interval
    
        // Add the table header and data below the interval
        XLSX.utils.sheet_add_json(worksheet, excelData, { origin: `A${currentRow + 1}`, skipHeader: false });
    
        // Create a new workbook and append the worksheet
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');
    
        // Style the header row
        const headerRowIndex = currentRow + 1;
        const headerRange = XLSX.utils.decode_range(worksheet['!ref']);
        for (let C = headerRange.s.c; C <= headerRange.e.c; C++) {
            const cellAddress = XLSX.utils.encode_cell({ c: C, r: headerRowIndex });
            if (!worksheet[cellAddress]) continue; // Skip if cell is not defined
            worksheet[cellAddress].s = {
                fill: { fgColor: { rgb: "007BFF" } }, // Blue background color
                font: { color: { rgb: "FFFFFF" }, bold: true }, // White text color, bold font
                alignment: { horizontal: "center", vertical: "center" } // Center alignment
            };
        }
    
        // Style the date range and interval cells
        worksheet[`A${currentRow - 3}`].s = { font: { bold: true } }; // Bold font for 'Reporting Period From:'
        worksheet[`D${currentRow - 3}`].s = { font: { bold: true } }; // Bold font for 'To:'
        worksheet[`A${currentRow - 1}`].s = { font: { bold: true } }; // Bold font for 'Interval:'
    
        // Save the Excel file
        XLSX.writeFile(workbook, 'report.xlsx');
    };
    
    return (
        <Modal show={show} onHide={handleClose} animation={false} centered size='lg'>
            <Modal.Header closeButton>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                    <Modal.Title style={{ marginBottom: '10px', fontWeight: 'bold' }}>
                        Report Generated
                    </Modal.Title>
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', padding: '0 15px' }}>
                        <div>
                            <div>
                                <strong>Start Date:</strong> {new Date(startDate).toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'short' })}
                            </div>
                            <div>
                                <strong>End Date:</strong> {new Date(endDate).toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'short' })}
                            </div>
                        </div>
                    </div>
                </div>
            </Modal.Header>
            <Modal.Body>
                <div className="table-responsive">
                    <Table striped bordered hover className="report-table">
                        <thead>
                            <tr>
                                {columnsToDisplay.map((column) => (
                                    <th key={column}>{column.replace(/_/g, ' ')}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {rows && rows.map((row, index) => (
                                <tr key={index}>
                                    {columnsToDisplay.map((column) => (
                                        <td key={column}>
                                            {column === 'DateAndTime'
                                                ? new Date(row[column]).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })
                                                : row[column]}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Close
                </Button>
                <Button variant="primary" onClick={downloadPDF}>
                    Download as PDF
                </Button>
                <Button variant="success" onClick={downloadExcel}>
                    Download as Excel
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ReportPage;
