// Backend API URL
const API_URL = '/api/agenda';

// Function to format date in Indonesian
function formatDate(dateString) {
    const days = [
        'Minggu', 'Senin', 'Selasa', 'Rabu',
        'Kamis', 'Jumat', 'Sabtu'
    ];
    const months = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];

    const date = new Date(dateString);
    const dayName = days[date.getDay()];
    const day = date.getDate();
    const monthName = months[date.getMonth()];
    const year = date.getFullYear();

    return `${dayName} ${day} ${monthName} ${year}`;
}

// Function to convert Airtable's markdown-like format to HTML
function convertMarkdownToHTML(text) {
    if (!text) return '';

    // Handle bullet points
    text = text.replace(/^[-*]\s+(.+)$/gm, '<li>$1</li>');
    text = text.replace(/<li>.*?<\/li>/gs, match => `<ul>${match}</ul>`);

    // Handle bold text
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Handle italic text
    text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');

    // Handle line breaks
    text = text.replace(/\n\n/g, '<br><br>');

    return text;
}

// Function to fetch data from our backend API
async function fetchAgendaItems() {
    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error('Failed to fetch agenda items');
        }

        const data = await response.json();
        return data.records;
    } catch (error) {
        console.error('Error fetching agenda items:', error);
        throw error;
    }
}

// Function to create agenda item HTML
function createAgendaItemHTML(record) {
    const fields = record.fields;
    const posterUrl = fields.poster && fields.poster[0] ? fields.poster[0].thumbnails.large.url : null;

    return `
        <article class="agenda-item">
            ${posterUrl ? `
                <div class="poster-container">
                    <img src="${posterUrl}" alt="${fields.title || 'Event poster'}" loading="lazy">
                </div>
            ` : ''}
            <div class="agenda-content">
                <h2>${fields.title || 'Untitled Event'}</h2>
                ${fields.date ? `<div class="date">${formatDate(fields.date)}</div>` : ''}
                ${fields.time ? `<div class="time">${fields.time}</div>` : ''}
                ${fields.descriptions ? `
                    <div class="description markdown-content">${convertMarkdownToHTML(fields.descriptions)}</div>
                ` : ''}
                ${fields.link ? `
                    <a href="${fields.link}" class="link" target="_blank" rel="noopener noreferrer">
                        Learn More
                    </a>
                ` : ''}
            </div>
        </article>
    `;
}

// Function to render agenda items
function renderAgendaItems(items) {
    const container = document.querySelector('.agenda-container');
    
    if (items.length === 0) {
        container.innerHTML = '<div class="error">No agenda items found</div>';
        return;
    }

    const sortedItems = items.sort((a, b) => 
        new Date(a.fields.date) - new Date(b.fields.date)
    );

    container.innerHTML = sortedItems
        .map(item => createAgendaItemHTML(item))
        .join('');
}

// Function to handle errors
function handleError(error) {
    const container = document.querySelector('.agenda-container');
    container.innerHTML = `
        <div class="error">
            Error loading agenda items. Please try again later.
        </div>
    `;
}

// Initialize the page
async function init() {
    try {
        const items = await fetchAgendaItems();
        renderAgendaItems(items);
    } catch (error) {
        handleError(error);
    }
}

// Start the application
init();