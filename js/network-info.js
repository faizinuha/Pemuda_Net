// Device Information Detection
function getDeviceInfo() {
    const browserInfo = document.getElementById('browserInfo');
    const osInfo = document.getElementById('osInfo');
    const screenInfo = document.getElementById('screenInfo');

    // Detect browser
    const userAgent = navigator.userAgent;
    let browser = "Unknown";
    if (userAgent.match(/chrome|chromium|crios/i)) {
        browser = "Chrome";
    } else if (userAgent.match(/firefox|fxios/i)) {
        browser = "Firefox";
    } else if (userAgent.match(/safari/i)) {
        browser = "Safari";
    } else if (userAgent.match(/opr\//i)) {
        browser = "Opera";
    } else if (userAgent.match(/edg/i)) {
        browser = "Edge";
    }

    // Detect OS
    let os = "Unknown";
    if (navigator.userAgent.indexOf("Win") != -1) os = "Windows";
    if (navigator.userAgent.indexOf("Mac") != -1) os = "MacOS";
    if (navigator.userAgent.indexOf("Linux") != -1) os = "Linux";
    if (navigator.userAgent.indexOf("Android") != -1) os = "Android";
    if (navigator.userAgent.indexOf("iOS") != -1) os = "iOS";

    // Screen resolution
    const resolution = `${window.screen.width}x${window.screen.height}`;

    browserInfo.textContent = `${browser}`;
    osInfo.textContent = `${os}`;
    screenInfo.textContent = `${resolution}`;
}

// Network Information Detection
async function getNetworkInfo() {
    const ipAddress = document.getElementById('ipAddress');
    const connectionType = document.getElementById('connectionType');
    const networkSpeed = document.getElementById('networkSpeed');

    // Get IP Address using multiple fallback APIs
    try {
        const ipApis = [
            'https://api.ipify.org?format=json',
            'https://api.myip.com',
            'https://api.ip.sb/jsonip'
        ];
        
        for (const api of ipApis) {
            try {
                const response = await fetch(api);
                const data = await response.json();
                ipAddress.textContent = data.ip;
                break;
            } catch (error) {
                continue;
            }
        }
    } catch (error) {
        ipAddress.textContent = 'Unable to detect';
    }

    // Get Connection Type with more detailed info
    if ('connection' in navigator) {
        const conn = navigator.connection;
        const effectiveType = conn.effectiveType?.toUpperCase() || 'Unknown';
        const downlink = conn.downlink ? `${conn.downlink} Mbps` : '';
        connectionType.textContent = `${effectiveType} ${downlink}`.trim();
        
        // Listen for connection changes
        conn.addEventListener('change', () => {
            const newEffectiveType = conn.effectiveType?.toUpperCase() || 'Unknown';
            const newDownlink = conn.downlink ? `${conn.downlink} Mbps` : '';
            connectionType.textContent = `${newEffectiveType} ${newDownlink}`.trim();
        });
    } else {
        connectionType.textContent = 'Not Available';
    }

    networkSpeed.textContent = 'Click "Start Speed Test" to measure';
}

// Function to fetch ISP and location information
async function getISPAndLocation() {
    const ispInfo = document.getElementById('ispInfoTest');
    const locationInfo = document.getElementById('locationInfoTest');

    try {
         //   Token is required for the API to work. Replace with your own token.
        //   You can get a free token from https://ipinfo.io/signup
        //   Note: The free tier has limitations on the number of requests per day.
        const response = await fetch('https://ipinfo.io/json?token=35f0f89e4080d3'); // Replace YOUR_TOKEN with a valid token
        const data = await response.json();
        ispInfo.textContent = data.org || 'Unknown';
        locationInfo.textContent = `${data.city}, ${data.region}, ${data.country}` || 'Unknown';
    } catch (error) {
        ispInfo.textContent = 'Unable to detect';
        locationInfo.textContent = 'Unable to detect';
    }
}

// Function to render speed test results in a chart
function renderSpeedTestChart(downloadSpeeds, latencies) {
    const ctx = document.getElementById('speedTestChartTest').getContext('2d');
    
    // Clear any existing chart
    if (window.speedTestChart) {
        window.speedTestChart.destroy();
    }
    
    window.speedTestChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: Array.from({ length: Math.max(downloadSpeeds.length, latencies.length) }, (_, i) => `Test ${i + 1}`),
            datasets: [
                {
                    label: 'Download Speed (Mbps)',
                    data: downloadSpeeds,
                    borderColor: '#f45a42',
                    backgroundColor: 'rgba(244, 90, 66, 0.1)',
                    fill: true,
                    tension: 0.4
                },
                {
                    label: 'Latency (ms)',
                    data: latencies,
                    borderColor: '#42a5f5',
                    backgroundColor: 'rgba(66, 165, 245, 0.1)',
                    fill: true,
                    tension: 0.4,
                    yAxisID: 'latency'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top'
                },
                tooltip: {
                    mode: 'index',
                    intersect: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Download Speed (Mbps)'
                    }
                },
                latency: {
                    position: 'right',
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Latency (ms)'
                    }
                }
            }
        }
    });
}

// Speed Test Function with multiple samples
async function startSpeedTest() {
    const spinnerOverlay = document.querySelector('.spinner-overlay');
    const progressBar = document.getElementById('progressBarTest');
    const testResultsDiv = document.getElementById('testResultsTest');
    const downloadSpeed = document.getElementById('downloadSpeedTest');
    const latency = document.getElementById('latencyTest');
    const startButton = document.getElementById('startTestButton');

    // Reset UI
    startButton.disabled = true;
    spinnerOverlay.classList.add('active');
    progressBar.style.width = '0%';
    progressBar.classList.remove('bg-danger');
    testResultsDiv.classList.add('d-none');
    
    const downloadSpeeds = [];
    const latencies = [];

    try {
        // Test latency with multiple CORS-friendly endpoints
        const pingUrls = [
            'https://api.github.com/zen',
            'https://jsonplaceholder.typicode.com/posts/1',
            'https://api.publicapis.org/entries'
        ];
        
        let totalLatency = 0;
        let successfulPings = 0;

        // Perform latency tests
        for (const url of pingUrls) {
            try {
                const pingStart = performance.now();
                const response = await fetch(url, {
                    method: 'HEAD',
                    mode: 'cors'
                });
                if (response.ok) {
                    const pingEnd = performance.now();
                    const pingTime = pingEnd - pingStart;
                    totalLatency += pingTime;
                    latencies.push(Math.round(pingTime));
                    successfulPings++;
                    progressBar.style.width = `${(successfulPings / pingUrls.length) * 30}%`;
                }
            } catch (error) {
                console.warn('Ping failed for:', url);
            }
        }

        // Update latency display
        if (successfulPings > 0) {
            const avgLatency = Math.round(totalLatency / successfulPings);
            latency.textContent = avgLatency;
            latencies.push(avgLatency); // Add average to graph
        } else {
            latency.textContent = 'Error';
        }

        // Download speed test with multiple samples using CORS-friendly endpoints
        const imageUrls = [
            'https://picsum.photos/1000/1000',
            'https://picsum.photos/1200/1200',
            'https://picsum.photos/1500/1500'
        ];
        
        let totalSpeed = 0;
        let successfulTests = 0;

        // Perform download speed tests
        for (const [index, url] of imageUrls.entries()) {
            try {
                const testStart = performance.now();
                const response = await fetch(url, { mode: 'cors' });
                if (response.ok) {
                    const blob = await response.blob();
                    const testEnd = performance.now();
                    const duration = (testEnd - testStart) / 1000; // seconds
                    const size = blob.size / (1024 * 1024); // Convert bytes to MB
                    const speed = (size * 8) / duration; // Mbps
                    totalSpeed += speed;
                    downloadSpeeds.push(parseFloat(speed.toFixed(2)));
                    successfulTests++;
                }
                progressBar.style.width = `${30 + ((index + 1) / imageUrls.length) * 70}%`;
            } catch (error) {
                console.warn('Speed test failed for:', url);
            }
        }

        // Show final results
        progressBar.style.width = '100%';
        testResultsDiv.classList.remove('d-none');
        
        if (successfulTests > 0) {
            const averageSpeed = totalSpeed / successfulTests;
            downloadSpeed.textContent = averageSpeed.toFixed(2);
        } else {
            downloadSpeed.textContent = 'Error';
        }

        // Render chart with all data
        renderSpeedTestChart(downloadSpeeds, latencies);

        // Gather all information for the report
        const deviceInfo = {
            browser: document.getElementById('browserInfo').textContent,
            os: document.getElementById('osInfo').textContent,
            screen: document.getElementById('screenInfo').textContent
        };

        const networkInfo = {
            ip: document.getElementById('ipAddress').textContent,
            connection: document.getElementById('connectionType').textContent,
            isp: document.getElementById('ispInfoTest').textContent,
            location: document.getElementById('locationInfoTest').textContent
        };

        const finalTestResults = {
            downloadSpeed: downloadSpeed.textContent,
            latency: latency.textContent
        };

        // Save the results
        saveTestResults(deviceInfo, networkInfo, finalTestResults);

    } catch (error) {
        console.error('Speed test failed:', error);
        downloadSpeed.textContent = 'Error';
        latency.textContent = 'Error';
        progressBar.style.width = '100%';
        progressBar.classList.add('bg-danger');
    } finally {
        // Re-enable button and hide spinner
        startButton.disabled = false;
        spinnerOverlay.classList.remove('active');
    }
}

// Function to save test results with confirmation
async function saveTestResults(deviceInfo, networkInfo, testResults) {
    // Ask for permission
    const shouldSave = await showDownloadConfirmation();
    if (!shouldSave) return;

    // Create the content
    const content = generateReportContent(deviceInfo, networkInfo, testResults);
    
    // Create file name with date and device info
    const date = new Date().toISOString().split('T')[0];
    const fileName = `SpeedTest_${deviceInfo.os}_${date}_${new Date().getTime()}.txt`;
    
    try {
        // Create a blob with the content
        const blob = new Blob([content], { type: 'text/plain' });
        
        // Create download link
        const downloadLink = document.createElement('a');
        downloadLink.download = fileName;
        downloadLink.href = window.URL.createObjectURL(blob);
        downloadLink.style.display = 'none';
        
        // Add to document, click it, and remove it
        document.body.appendChild(downloadLink);
        downloadLink.click();
        
        // Cleanup
        setTimeout(() => {
            document.body.removeChild(downloadLink);
            window.URL.revokeObjectURL(downloadLink.href);
        }, 100);

        showNotification('Data berhasil disimpan!', 'success');
    } catch (error) {
        console.error('Error saving file:', error);
        showNotification('Gagal menyimpan data', 'error');
    }
}

// Function to show download confirmation dialog
function showDownloadConfirmation() {
    return new Promise((resolve) => {
        const modal = document.createElement('div');
        modal.className = 'download-modal';
        modal.innerHTML = `
            <div class="download-modal-content">
                <h3>Simpan Hasil Test</h3>
                <p>Apakah Anda ingin menyimpan hasil test ini?</p>
                <div class="download-modal-buttons">
                    <button class="btn btn-secondary" id="cancelDownload">Batal</button>
                    <button class="btn btn-primary" id="confirmDownload">Simpan</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        const confirmBtn = document.getElementById('confirmDownload');
        const cancelBtn = document.getElementById('cancelDownload');

        confirmBtn.onclick = () => {
            document.body.removeChild(modal);
            resolve(true);
        };

        cancelBtn.onclick = () => {
            document.body.removeChild(modal);
            resolve(false);
        };
    });
}

// Function to show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    getDeviceInfo();
    getNetworkInfo();
    getISPAndLocation();

    document.getElementById('startTestButton').addEventListener('click', startSpeedTest);
});