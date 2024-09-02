$(document).ready(function () {
    let connectionString = '';

    /**
     * Veritabanı bağlantısı formu gönderildiğinde tetiklenir.
     * Bağlantı verilerini toplar ve veritabanı objelerini yükleme işlemini başlatır.
     */
    $('#dbConnectionForm').submit(function (event) {
        event.preventDefault();

        const connectionData = {
            server: $('#server').val(),
            database: $('#database').val(),
            username: $('#username').val(),
            password: $('#password').val()
        };

        connectionString = createConnectionString(connectionData);
        showLoading('Bağlanıyor...', 'Veritabanına bağlanırken lütfen bekleyin.');
        loadDatabaseObjects(connectionData);
    });

    /**
     * "Devam" butonuna tıklandığında tetiklenir.
     * İkinci adımı gizler ve üçüncü adıma geçer.
     * Veritabanı objesi seçilmediyse kullanıcıya uyarı mesajı gösterir.
     */
    $('#continueBtn').click(function () {
        const selectedObject = $('#dbObjects').val();
        if (!selectedObject) { // Eğer bir veritabanı objesi seçilmediyse
            Swal.fire({
                icon: 'warning',
                title: 'Dikkat!',
                text: 'Lütfen bir veritabanı objesi seçin.',
                confirmButtonColor: '#007bff',
                width: '400px'
            });
            return; // İlerlemeyi durdur
        }
        $('#step2').hide();
        $('#step3').show();
    });

    /**
     * Grafik oluşturma butonuna tıklandığında tetiklenir.
     * Seçilen veritabanı objesini ve grafik türlerini alır ve grafikleri oluşturur.
     * Grafik türü seçilmediyse kullanıcıya uyarı mesajı gösterir.
     */
    $('#generateChartBtn').click(function () {
        const selectedCharts = $('#chartType').val();
        if (!selectedCharts || selectedCharts.length === 0) { // Eğer bir grafik türü seçilmediyse
            Swal.fire({
                icon: 'warning',
                title: 'Dikkat!',
                text: 'Lütfen en az bir grafik türü seçin.',
                confirmButtonColor: '#007bff',
                width: '400px'
            });
            return; // İlerlemeyi durdur
        }

        $('#step3').hide();
        $('#chartContainer').show();
        $('#homeBtnTop').show();

        const selectedObject = $('#dbObjects').val();
        generateCharts(selectedObject, selectedCharts);
    });

    /**
     * "Geri Dön" butonlarının tıklama işlemlerini yönetir.
     * Uygulama adımları arasında geçiş yapar.
     */
    $('#backBtnStep2').click(function () {
        $('#step2').hide();
        $('#step1').show();
    });

    $('#backBtnStep3').click(function () {
        $('#step3').hide();
        $('#step2').show();
    });

    /**
     * "Anasayfaya Dön" butonuna tıklandığında tetiklenir.
     * Uygulamayı başlangıç durumuna döndürmek için sayfayı yeniler.
     */
    $('#homeBtnTop').click(function () {
        location.reload();
    });

    /**
     * Veritabanı bağlantısı için gerekli bağlantı dizesini oluşturur.
     * @param {Object} connectionData - Sunucu, veritabanı, kullanıcı adı ve şifre bilgilerini içerir.
     * @returns {string} - Formatlanmış bağlantı dizesi.
     */
    function createConnectionString(connectionData) {
        return `Server=${connectionData.server};Database=${connectionData.database};User Id=${connectionData.username};Password=${connectionData.password};TrustServerCertificate=True;`;
    }

    /**
     * Veritabanına bağlanırken yükleme ekranını gösterir.
     * @param {string} title - Yükleme ekranında gösterilecek başlık.
     * @param {string} text - Yükleme ekranında gösterilecek mesaj.
     */
    function showLoading(title, text) {
        Swal.fire({
            title: title,
            text: text,
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });
    }

    /**
     * Veritabanı objelerini sunucudan yükler.
     * @param {Object} connectionData - Bağlantı bilgilerini içerir.
     */
    function loadDatabaseObjects(connectionData) {
        $.ajax({
            type: 'POST',
            url: 'https://apidemo.fatihsevencan.com/api/Chart/list-functions-views',
            data: JSON.stringify(connectionData),
            contentType: 'application/json',
            success: function (data) {
                Swal.close();
                $('#step1').hide();
                $('#step2').show();
                $('#welcomeMessage').hide();

                // Gelen veri boş mu kontrol et
                if (data.length === 0) {
                    // Eğer boşsa uyarı mesajı göster
                    Swal.fire({
                        icon: 'info',
                        title: 'Bilgi',
                        text: 'Seçtiğiniz veritabanında VIEW, FUNCTION veya PROCEDURE bulunamadı.',
                        confirmButtonColor: '#007bff',
                        width: '400px'
                    });
                    return; // İşlemi durdur
                }

                $('#dbObjects').empty().append('<option disabled selected>Bir veritabanı objesi seçin</option>');
                $.each(data, function (index, item) {
                    $('#dbObjects').append(new Option(item.ObjectName + ' (' + item.ObjectType + ')', `${item.ObjectType} ${item.ObjectName}`));
                });
            },
            error: function (error) {
                showError('Bağlantı hatası', error);
            }
        });
    }

    /**
     * Seçilen grafik türlerini oluşturur.
     * @param {string} selectedObject - Seçilen veritabanı objesi.
     * @param {Array} selectedCharts - Oluşturulacak grafik türlerinin listesi.
     */
    function generateCharts(selectedObject, selectedCharts) {
        $('#charts').empty();

        const chartCount = selectedCharts.length;

        selectedCharts.forEach(function (chartType) {
            const chartCard = $('<div>')
                .addClass('card shadow-lg chart-item')
                .attr('data-chart-title', chartType.charAt(0).toUpperCase() + chartType.slice(1) + ' Chart')
                .css({
                    'flex': chartCount === 1 ? '0 1 80%' : '1 1 calc(50% - 40px)',
                    'min-width': '400px',
                    'height': '400px',
                    'border': '1px solid #ddd',
                    'border-radius': '8px',
                    'background-color': '#ffffff',
                    'box-shadow': '0 4px 8px rgba(0, 0, 0, 0.1)',
                    'margin-bottom': '20px',
                    'position': 'relative',
                    'overflow': 'hidden'
                });

            const chartTitle = $('<div>')
                .addClass('chart-title')
                .text(chartType.charAt(0).toUpperCase() + chartType.slice(1) + ' Chart')
                .css({
                    'position': 'absolute',
                    'top': '10px',
                    'left': '20px',
                    'font-weight': 'bold',
                    'font-size': '16px',
                    'color': '#333',
                    'border-bottom': '2px solid #ddd',
                    'padding-bottom': '5px',
                    'width': 'fit-content'
                });

            const chartBody = $('<div>')
                .addClass('card-body chart-body')
                .css({
                    'margin-top': '30px'
                });

            const ctx = $('<canvas>')[0];

            chartBody.append(ctx);
            chartCard.append(chartTitle);
            chartCard.append(chartBody);
            $('#charts').append(chartCard);

            executeQueryAndDrawChart(selectedObject, chartType, ctx, chartCard);
        });
    }

    /**
     * Sorguyu oluşturur ve grafiği çizer.
     * @param {string} objectInfo - Veritabanı objesi bilgisi (Tür ve isim).
     * @param {string} chartType - Grafik türü.
     * @param {Object} ctx - Canvas öğesi.
     * @param {Object} chartCard - Grafik kartı öğesi.
     */
    function executeQueryAndDrawChart(objectInfo, chartType, ctx, chartCard) {
        const [objectType, objectName] = objectInfo.split(' ');

        if (!objectType || !objectName) {
            showError('Geçersiz obje türü veya adı', { message: `Obje bilgisi geçersiz: ${objectInfo}` });
            return;
        }

        const query = generateQuery(objectType, objectName);
        if (!query) {
            showError('Geçersiz sorgu oluşturulamadı', { message: `Sorgu oluşturulamadı: ${objectInfo}` });
            return;
        }

        const queryRequest = {
            ConnectionString: connectionString,
            Query: query
        };

        $.ajax({
            type: 'POST',
            url: 'https://apidemo.fatihsevencan.com/api/Chart/execute-query',
            data: JSON.stringify(queryRequest),
            contentType: 'application/json',
            success: function (data) {
                drawChart(chartType, data, ctx, objectName);
            },
            error: function (error) {
                showError('Veri kümesi alınırken bir hata oluştu', error);
            }
        });
    }

    /**
     * Sorguyu oluşturur.
     * @param {string} objectType - Veritabanı objesi türü (VIEW, FUNCTION, PROCEDURE).
     * @param {string} objectName - Veritabanı objesi adı.
     * @returns {string|null} - Oluşturulan sorgu ya da null.
     */
    function generateQuery(objectType, objectName) {
        if (objectType === "VIEW") {
            return `SELECT * FROM ${objectName}`;
        } else if (objectType === "FUNCTION") {
            return `SELECT * FROM ${objectName}()`;
        } else if (objectType === "PROCEDURE") {
            return `EXEC ${objectName}`;
        }
        return null;
    }

    /**
     * Grafiği çizer.
     * @param {string} chartType - Grafik türü.
     * @param {Object} data - Grafik verileri.
     * @param {Object} ctx - Canvas öğesi.
     * @param {string} title - Grafik başlığı.
     */
    function drawChart(chartType, data, ctx, title) {
        new Chart(ctx, {
            type: chartType,
            data: {
                labels: data.labels,
                datasets: data.datasets.map((dataset, index) => ({
                    label: dataset.label,
                    data: dataset.data,
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.2)',
                        'rgba(54, 162, 235, 0.2)',
                        'rgba(255, 206, 86, 0.2)',
                        'rgba(75, 192, 192, 0.2)',
                        'rgba(153, 102, 255, 0.2)',
                        'rgba(255, 159, 64, 0.2)'
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)',
                        'rgba(255, 159, 64, 1)'
                    ],
                    borderWidth: 2,
                    pointRadius: 5,
                    tension: 0.4
                }))
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        display: true,
                        title: {
                            display: true,
                            text: title,
                            color: '#666',
                            font: {
                                size: 14,
                                weight: 'bold'
                            },
                            padding: {
                                top: 20,
                                bottom: 20
                            }
                        },
                        ticks: {
                            color: '#333'
                        }
                    },
                    y: {
                        display: true,
                        title: {
                            display: true,
                            text: 'Değerler',
                            color: '#666',
                            font: {
                                size: 14
                            }
                        },
                        ticks: {
                            color: '#333'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            color: '#333',
                            font: {
                                size: 12
                            }
                        }
                    }
                }
            }
        });
    }

    /**
     * Hata mesajını gösterir.
     * @param {string} title - Hata başlığı.
     * @param {Object} error - Hata bilgisi.
     */
    function showError(title, error) {
        const errorMessage = error.responseJSON ? error.responseJSON.message : 'Bilinmeyen bir hata oluştu.';

        Swal.fire({
            icon: 'error',
            title: 'Hata!',
            text: `${title}: ${errorMessage}`,
            confirmButtonColor: '#007bff',
            width: '400px'
        });
    }
});