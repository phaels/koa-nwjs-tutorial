// Erweiterte Demo Funktionen mit Koa.js Features
const demo = {
    // Status laden
    async loadStatus() {
        try {
            const res = await fetch('/api/status');
            const data = await res.json();

            $('#status').html(`
            <div class="fade-in">
            <div class="row text-center">
            <div class="col-6 mb-3">
            <h5>${data.memory} MB</h5>
            <small class="text-muted">Speicher</small>
            </div>
            <div class="col-6 mb-3">
            <h5>${data.uptime}s</h5>
            <small class="text-muted">Uptime</small>
            </div>
            <div class="col-12">
            <span class="badge bg-success">
            <i class="bi bi-check-circle"></i> ${data.status.toUpperCase()}
            </span>
            <div class="mt-2">
            <small class="text-muted koa-badge">Koa.js ${data.framework.split(' ')[1]}</small>
            </div>
            </div>
            </div>
            </div>
            `);
        } catch (err) {
            $('#status').html(`
            <div class="alert alert-danger">
            <i class="bi bi-exclamation-triangle"></i> Fehler beim Laden
            </div>
            `);
        }
    },

    // Features laden
    async loadFeatures() {
        try {
            const res = await fetch('/api/features');
            const data = await res.json();

            let html = '<div class="fade-in"><ul class="list-group">';

            ['koa', 'handlebars', 'jquery'].forEach(key => {
                html += `<li class="list-group-item">
                <strong><i class="bi bi-${this.getIconForFeature(key)}"></i> ${this.capitalize(key)}:</strong>
                ${data[key].slice(0, 3).join(', ')}
                </li>`;
            });

            html += '</ul></div>';
            $('#features').html(html);
        } catch (err) {
            $('#features').html(`
            <div class="alert alert-danger">
            <i class="bi bi-exclamation-triangle"></i> Fehler beim Laden
            </div>
            `);
        }
    },

    // Koa Context Demo
    async testKoaContext() {
        try {
            $('#demo-output, #middleware-output').html(`
            <div class="text-center">
            <div class="spinner-border text-primary"></div>
            <p class="mt-2">Lade Koa Context Daten...</p>
            </div>
            `);

            const res = await fetch('/context-demo');
            const data = await res.json();

            const output = `
            <div class="fade-in">
            <div class="alert alert-success">
            <h5><i class="bi bi-check-circle"></i> Koa Context Demo</h5>
            <p class="mb-0">Koa's Context Object erfolgreich geladen</p>
            </div>

            <div class="context-demo mt-3">
            <h6>Request Details:</h6>
            ${this.renderObject(data.request)}

            <h6 class="mt-3">Response Details:</h6>
            ${this.renderObject(data.response)}

            <h6 class="mt-3">App State:</h6>
            ${this.renderObject(data.state)}
            </div>
            </div>
            `;

            $('#demo-output, #middleware-output').html(output);
        } catch (err) {
            $('#demo-output, #middleware-output').html(`
            <div class="alert alert-danger fade-in">
            <i class="bi bi-exclamation-triangle"></i> Fehler: ${err.message}
            </div>
            `);
        }
    },

    // Error Handling Demo
    async testErrorHandling() {
        try {
            $('#demo-output, #middleware-output').html(`
            <div class="text-center">
            <div class="spinner-border text-warning"></div>
            <p class="mt-2">Teste Error Handling...</p>
            </div>
            `);

            const res = await fetch('/error-demo?throw=true');

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error.message);
            }

            const data = await res.json();
            $('#demo-output, #middleware-output').html(`
            <div class="alert alert-info fade-in">
            <i class="bi bi-info-circle"></i> ${data.message}
            </div>
            `);
        } catch (err) {
            $('#demo-output, #middleware-output').html(`
            <div class="alert alert-danger fade-in">
            <h5><i class="bi bi-bug"></i> Koa Error Handling Demo</h5>
            <p class="mb-0">Fehler erfolgreich abgefangen: <strong>${err.message}</strong></p>
            <small class="text-muted">Dies zeigt Koa's eingebaute Error Propagation</small>
            </div>
            `);
        }
    },

    // Tech Stack laden (About Page)
    async loadStack() {
        try {
            const res = await fetch('/api/stack');
            const stack = await res.json();

            let html = '<div class="fade-in"><div class="row g-3">';
            stack.forEach(item => {
                html += `
                <div class="col-md-6">
                <div class="card">
                <div class="card-body">
                <div class="d-flex align-items-center">
                <i class="bi ${item.icon} display-6 text-primary me-3"></i>
                <div>
                <h5 class="mb-1">${item.name}</h5>
                <p class="mb-1 text-muted">${item.desc}</p>
                <span class="badge bg-primary">${item.version}</span>
                </div>
                </div>
                </div>
                </div>
                </div>
                `;
            });
            html += '</div></div>';

            $('#tech-stack').html(html);
        } catch (err) {
            $('#tech-stack').html(`
            <div class="alert alert-danger">
            <i class="bi bi-exclamation-triangle"></i> Fehler beim Laden
            </div>
            `);
        }
    },

    // Hilfsfunktionen
    getIconForFeature(feature) {
        const icons = {
            koa: 'lightning',
            handlebars: 'file-code',
            jquery: 'gear'
        };
        return icons[feature] || 'question-circle';
    },

    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    },

    renderObject(obj, depth = 0) {
        if (depth > 2) return '<span class="text-muted">[Nested Object]</span>';

        let html = '';
        for (const [key, value] of Object.entries(obj)) {
            if (value && typeof value === 'object' && !Array.isArray(value)) {
                html += `<div class="context-item" style="margin-left: ${depth * 20}px">
                <strong>${key}:</strong> ${this.renderObject(value, depth + 1)}
                </div>`;
            } else if (Array.isArray(value)) {
                html += `<div class="context-item" style="margin-left: ${depth * 20}px">
                <strong>${key}:</strong> [${value.slice(0, 3).join(', ')}${value.length > 3 ? '...' : ''}]
                </div>`;
            } else {
                html += `<div class="context-item" style="margin-left: ${depth * 20}px">
                <strong>${key}:</strong> <code>${value}</code>
                </div>`;
            }
        }
        return html;
    },

    // Animation Demo
    animateCard() {
        const card = $('#demo-output').closest('.card');
        card.addClass('shadow-lg');
        $('#demo-output').html(`
        <div class="alert alert-success fade-in">
        <i class="bi bi-check-circle"></i> Animation ausgeführt!
        </div>
        `);
        setTimeout(() => card.removeClass('shadow-lg'), 1000);
    }
};

// Auto-Load bei Seitenaufruf
$(document).ready(() => {
    // Home Page
    if ($('#status').length) {
        demo.loadStatus();
        demo.loadFeatures();
        setInterval(demo.loadStatus, 30000); // Update alle 30s
    }

    // About Page
    if ($('#tech-stack').length) {
        demo.loadStack();
    }

    // Card Hover Effects
    $('.card').hover(
        function() { $(this).addClass('shadow-lg'); },
                     function() { $(this).removeClass('shadow-lg'); }
    );

    // Koa Middleware Visualisierung
    if ($('#middleware-output').length) {
        $('.middleware-chain').show();
    }
});
