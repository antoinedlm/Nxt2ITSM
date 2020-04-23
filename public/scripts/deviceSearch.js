$(document).ready(function () {

    let allDevices = [];

    $("[name='search']").click(function () {
        const searchString = $("[name='searchBox']").val().toLowerCase();
        console.log(searchString);
        const filteredDevices = allDevices.filter((device) => {
            return (
                device.name.toLowerCase().includes(searchString)
            );
        });
        displayDevices(filteredDevices);
    });

    $("[name='searchBox']").on('keypress', function (event) {
        if (event.which == 13) {
            const searchString = $(this).val().toLowerCase();
            console.log(searchString);
            const filteredDevices = allDevices.filter((device) => {
                return (
                    device.name.toLowerCase().includes(searchString)
                );
            });
            displayDevices(filteredDevices);
        }
    });

    const loadDevices = async () => {
        try {
            $.getJSON("devicesList.json", function (result) {
                $.each(result, function (i, field) {
                    allDevices.push({ name: i });
                });
            })
                .done(function () {
                    console.log('Devices Retrieved!');
                });
        } catch (err) {
            console.error(err);
        }
    };

    const displayDevices = (devices) => {
        const htmlString = devices
            .map((device) => {
                var link = window.location.origin.concat('/device/', device.name);
                return `
            <li>
                <a href='${link}'>${device.name}</a>
            </li>
        `;
            })
            .join('');
        $("[id='devicesList']").html(htmlString);
    };

    loadDevices();
});