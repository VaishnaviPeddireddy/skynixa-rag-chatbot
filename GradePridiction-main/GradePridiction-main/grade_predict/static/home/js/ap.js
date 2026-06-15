
function home() {
    location.reload();
}

function grade() {
    $("#body").load("grade/");
    $("#grade").addClass("active");
    $("#home").removeClass("active");
    $("#graph").removeClass("active");
}

function graph() {
    $("#body").load("graph/");
    $("#graph").addClass("active");
    $("#home").removeClass("active");
    $("#grade").removeClass("active");
}



    function submitbtn() {

        // Get form
        var form = $('#myform')[0];

       // Create an FormData object
        var data = new FormData(form);

        $("#btnSubmit").prop("disabled", true);

        $.ajax({
            type: "POST",
            enctype: 'multipart/form-data',
            url: "/grade-predict/",
            data: data,
            processData: false,
            contentType: false,
            cache: false,
            timeout: 800000,
            success: function (data) {

                $("#result").text(data);
                console.log("SUCCESS : ", data);
                $("#btnSubmit").prop("disabled", false);

                var modal = document.getElementById("myModal");

                modal.style.display = "block";

            },
            error: function (e) {

                $("#output").text(e.responseText);
                console.log("ERROR : ", e);
                $("#btnSubmit").prop("disabled", false);

            }
        });

    }

    function close1() {
        var modal = document.getElementById("myModal");
        modal.style.display = "none";
    }

